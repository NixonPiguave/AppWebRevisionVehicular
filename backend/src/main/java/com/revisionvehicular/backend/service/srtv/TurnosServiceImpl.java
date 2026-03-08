package com.revisionvehicular.backend.service.srtv;

import com.revisionvehicular.backend.dtos.rtv.MetodoInspeccionDTO;
import com.revisionvehicular.backend.dtos.srtv.TurnosDTO;
import com.revisionvehicular.backend.entities.rtv.MetodoInspeccion;
import com.revisionvehicular.backend.entities.rtv.TarifarioTramite;
import com.revisionvehicular.backend.entities.srtv.Turnos;
import com.revisionvehicular.backend.repositories.rtv.IDetalleInspeccionRepository;
import com.revisionvehicular.backend.repositories.rtv.IInspeccionRepository;
import com.revisionvehicular.backend.repositories.rtv.IMetodoInspeccionRepository;
import com.revisionvehicular.backend.repositories.rtv.ITarifarioTramiteRepository;
import com.revisionvehicular.backend.repositories.srtv.ITurnosRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class TurnosServiceImpl implements ITurnosService {

    private final ITurnosRepository repository;
    private final ITarifarioTramiteRepository tarifarioRepository;
    private final IDetalleInspeccionRepository detalleInspeccionRepository;
    private final IInspeccionRepository inspeccionRepository;
    private final IMetodoInspeccionRepository metodoInspeccionRepository;
    private final AuditoriaService auditoriaService;

    @Autowired
    public TurnosServiceImpl(ITurnosRepository repository,
                             ITarifarioTramiteRepository tarifarioRepository,
                             IDetalleInspeccionRepository detalleInspeccionRepository,
                             IInspeccionRepository inspeccionRepository,
                             IMetodoInspeccionRepository metodoInspeccionRepository,
                             AuditoriaService auditoriaService) {
        this.repository = repository;
        this.tarifarioRepository = tarifarioRepository;
        this.detalleInspeccionRepository = detalleInspeccionRepository;
        this.inspeccionRepository = inspeccionRepository;
        this.metodoInspeccionRepository = metodoInspeccionRepository;
        this.auditoriaService = auditoriaService;
    }

    @Override
    public TurnosDTO save(TurnosDTO dto) {
        repository.insertarTurno(
                dto.getPropietarioId(),
                dto.getVehiculoId(),
                dto.getServicioId(),
                null,
                dto.getFechaInicio(),
                null,
                null,
                dto.getEstado()
        );

        // Tomar siempre el último turno insertado (mayor ID)
        Turnos ultimo = repository.findTopByOrderByTurnoIdDesc();
        if (ultimo == null) {
            throw new RuntimeException("Error al crear turno");
        }
        auditoriaService.registrar("INSERT", "Turnos", "Creó turno ID " + ultimo.getTurnoId());
        return toDTO(ultimo);
    }

    @Override
    public TurnosDTO findById(Long id) {
        return toDTO(repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado con ID: " + id)));
    }

    @Override
    public List<TurnosDTO> findAll() {
        return repository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public TurnosDTO update(Long id, TurnosDTO dto) {
        Turnos existente = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado con ID: " + id));

        Long tramiteId = existente.getTramite() != null
                ? existente.getTramite().getIdTramite()
                : null;

        repository.actualizarTurno(
                id,
                dto.getPropietarioId(),
                dto.getVehiculoId(),
                dto.getServicioId(),
                tramiteId,
                dto.getFechaInicio(),
                existente.getFechaFin(),
                existente.getFechaCancelado(),
                dto.getEstado()
        );

        auditoriaService.registrar("UPDATE", "Turnos", "Actualizó turno ID " + id);
        return toDTO(repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error al recuperar el turno actualizado")));
    }

    @Override
    public void delete(Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            auditoriaService.registrar("DELETE", "Turnos", "Eliminó turno ID " + id);
        } else {
            throw new RuntimeException("El turno no existe");
        }
    }

    @Override
    public List<TurnosDTO> findTurnosPagados() {
        return repository.findByEstadoOrderByFechaInicioDesc("PAGADO")
                .stream()
                .filter(t -> !"FINALIZADO".equalsIgnoreCase(t.getEstado()))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<TurnosDTO> findTurnosPagadosPorServicio(Long servicioId) {
        if (servicioId == null) {
            return findTurnosPagados();
        }
        return repository.findByEstadoAndServicio_IdTipoTramiteOrderByFechaInicioDesc("PAGADO", servicioId)
                .stream()
                .filter(t -> !"FINALIZADO".equalsIgnoreCase(t.getEstado()))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public TurnosDTO actualizarMontoPagado(Long turnoId, BigDecimal montoPagado) {
        repository.actualizarMontoPagado(turnoId, montoPagado);
        return findById(turnoId);
    }

    @Override
    public BigDecimal obtenerTarifaPorTurno(Long turnoId) {
        Turnos turno = repository.findById(turnoId)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado con ID: " + turnoId));

        if (turno.getServicio() == null) return null;

        return tarifarioRepository
                .findByServicio_IdTipoTramiteAndEstado(turno.getServicio().getIdTipoTramite(), "ACTIVO")
                .map(TarifarioTramite::getTarifa)
                .orElse(null);
    }
    @Override
    @Transactional
    public TurnosDTO cambiarEstado(Long turnoId, String nuevoEstado) {
        Turnos turno = repository.findById(turnoId)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado con ID: " + turnoId));

        repository.actualizarTurno(
                turnoId,
                turno.getPropietario() != null ? turno.getPropietario().getIdPropietario() : null,
                turno.getVehiculo()    != null ? turno.getVehiculo().getVehiculoid()       : null,
                turno.getServicio()    != null ? turno.getServicio().getIdTipoTramite()    : null,
                turno.getTramite()     != null ? turno.getTramite().getIdTramite()         : null,
                turno.getFechaInicio(),
                turno.getFechaFin(),
                turno.getFechaCancelado(),
                nuevoEstado
        );

        return findById(turnoId);
    }

    @Override
    public List<MetodoInspeccionDTO> findMetodosInspeccionPendientes(Long turnoId) {
        Turnos turno = repository.findById(turnoId)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado con ID: " + turnoId));
        Long vehiculoId = turno.getVehiculo() != null ? turno.getVehiculo().getVehiculoid() : null;
        if (vehiculoId == null) {
            return metodoInspeccionRepository.findAll().stream()
                    .filter(m -> m.getMetodoinspeccionid() != null)
                    .map(this::toMetodoDTO)
                    .collect(Collectors.toList());
        }
        // Métodos ya realizados: desde rtv_detalle_inspeccion (el método se guarda en el detalle)
        Set<Long> metodoIdsRealizados = detalleInspeccionRepository
                .findMetodoIdsRealizadosPorVehiculo(vehiculoId)
                .stream()
                .filter(id -> id != null)
                .collect(Collectors.toSet());
        return metodoInspeccionRepository.findAll().stream()
                .filter(m -> m.getMetodoinspeccionid() != null && !metodoIdsRealizados.contains(m.getMetodoinspeccionid()))
                .map(this::toMetodoDTO)
                .collect(Collectors.toList());
    }

    private MetodoInspeccionDTO toMetodoDTO(MetodoInspeccion m) {
        MetodoInspeccionDTO dto = new MetodoInspeccionDTO();
        dto.setId(m.getMetodoinspeccionid());
        dto.setNombre(m.getNombre());
        dto.setDescripcion(m.getDescripcion());
        dto.setEstado(m.getEstado());
        return dto;
    }

    private TurnosDTO toDTO(Turnos turno) {
        TurnosDTO dto = new TurnosDTO();
        dto.setTurnoId(turno.getTurnoId());
        dto.setPropietarioId(turno.getPropietario() != null ? turno.getPropietario().getIdPropietario() : null);
        dto.setVehiculoId(turno.getVehiculo() != null ? turno.getVehiculo().getVehiculoid() : null);
        dto.setServicioId(turno.getServicio() != null ? turno.getServicio().getIdTipoTramite() : null);
        dto.setTramiteId(turno.getTramite() != null ? turno.getTramite().getIdTramite() : null);
        dto.setFechaInicio(turno.getFechaInicio());
        dto.setFechaFin(turno.getFechaFin());
        dto.setFechaCancelado(turno.getFechaCancelado());
        dto.setEstado(turno.getEstado());
        dto.setMontoPagado(turno.getMontoPagado());
        dto.setValidador(turno.getValidador());
        return dto;
    }
}