package com.revisionvehicular.backend.service.srtv;

import com.revisionvehicular.backend.dtos.rtv.MetodoInspeccionDTO;
import com.revisionvehicular.backend.dtos.srtv.TurnosDTO;
import com.revisionvehicular.backend.entities.cv.Categoria;
import com.revisionvehicular.backend.entities.rtv.MetodoInspeccion;
import com.revisionvehicular.backend.entities.rtv.TarifarioTramite;
import com.revisionvehicular.backend.entities.srtv.Turnos;
import com.revisionvehicular.backend.repositories.rtv.IDetalleInspeccionRepository;
import com.revisionvehicular.backend.repositories.rtv.IInspeccionRepository;
import com.revisionvehicular.backend.repositories.rtv.IMetodoInspeccionRepository;
import com.revisionvehicular.backend.repositories.rtv.ITarifarioTramiteRepository;
import com.revisionvehicular.backend.repositories.srtv.ITurnosRepository;
import com.revisionvehicular.backend.service.rtv.ILineaService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class TurnosServiceImpl implements ITurnosService {

    private static final List<String> ESTADOS_PARA_INICIAR_INSPECCION = List.of("PAGADO", "CONFIRMADO", "EN_PROCESO");

    private final ITurnosRepository repository;
    private final ITarifarioTramiteRepository tarifarioRepository;
    private final IDetalleInspeccionRepository detalleInspeccionRepository;
    private final IInspeccionRepository inspeccionRepository;
    private final IMetodoInspeccionRepository metodoInspeccionRepository;
    private final ILineaService lineaService;
    private final AuditoriaService auditoriaService;

    @Autowired
    public TurnosServiceImpl(ITurnosRepository repository,
                             ITarifarioTramiteRepository tarifarioRepository,
                             IDetalleInspeccionRepository detalleInspeccionRepository,
                             IInspeccionRepository inspeccionRepository,
                             IMetodoInspeccionRepository metodoInspeccionRepository,
                             ILineaService lineaService,
                             AuditoriaService auditoriaService) {
        this.repository = repository;
        this.tarifarioRepository = tarifarioRepository;
        this.detalleInspeccionRepository = detalleInspeccionRepository;
        this.inspeccionRepository = inspeccionRepository;
        this.metodoInspeccionRepository = metodoInspeccionRepository;
        this.lineaService = lineaService;
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
    public List<TurnosDTO> findTurnosPorEstado(String estado) {
        if (estado == null || estado.isBlank()) {
            return findAll();
        }
        return repository.findByEstadoOrderByFechaInicioDesc(estado).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<TurnosDTO> findTurnosPorEstadoYServicio(String estado, Long servicioId) {
        if (estado == null || estado.isBlank()) {
            if (servicioId == null) return findAll();
            return repository.findByServicio_IdTipoTramiteOrderByFechaInicioDesc(servicioId).stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        }
        if (servicioId == null) {
            return findTurnosPorEstado(estado);
        }
        return repository.findByEstadoAndServicio_IdTipoTramiteOrderByFechaInicioDesc(estado, servicioId).stream()
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
        return repository.findByEstadoInOrderByFechaInicioDesc(ESTADOS_PARA_INICIAR_INSPECCION)
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
        return repository.findByEstadoInAndServicio_IdTipoTramiteOrderByFechaInicioDesc(ESTADOS_PARA_INICIAR_INSPECCION, servicioId)
                .stream()
                .filter(t -> !"FINALIZADO".equalsIgnoreCase(t.getEstado()))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<TurnosDTO> findTurnosPagadosPorServicioYLinea(Long servicioId, Long lineaId) {
        if (lineaId == null) {
            return findTurnosPagadosPorServicio(servicioId);
        }
        // Determinar categorías según línea: L=motos, M/N=carros (normativa ANT Ecuador)
        String nombreLinea = lineaService.findById(lineaId).getNombre();
        boolean esLineaMoto = nombreLinea != null && nombreLinea.toLowerCase().contains("moto");
        Set<String> codigosCategoriaFiltro = esLineaMoto
                ? Set.of("L")
                : Set.of("M", "N");

        Stream<com.revisionvehicular.backend.entities.srtv.Turnos> stream;
        if (servicioId == null) {
            stream = repository.findTurnosPagadosWithVehiculoCategoria(ESTADOS_PARA_INICIAR_INSPECCION).stream();
        } else {
            stream = repository.findTurnosPagadosWithVehiculoCategoriaPorServicio(ESTADOS_PARA_INICIAR_INSPECCION, servicioId).stream();
        }

        return stream
                .filter(t -> !"FINALIZADO".equalsIgnoreCase(t.getEstado()))
                .filter(t -> {
                    var v = t.getVehiculo();
                    if (v == null) return false;
                    var sub = v.getSubcategoria();
                    if (sub == null) return false;
                    Categoria cat = sub.getCategoria();
                    if (cat == null || cat.getCodigo() == null) return false;
                    String codigo = cat.getCodigo().trim().toUpperCase();
                    return codigosCategoriaFiltro.contains(codigo);
                })
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
        Turnos turno = repository.findByIdWithServicioYVehiculoCategoria(turnoId)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado con ID: " + turnoId));

        if (turno.getServicio() == null) return null;

        Long servicioId = turno.getServicio().getIdTipoTramite();
        Long categoriaId = null;
        if (turno.getVehiculo() != null
                && turno.getVehiculo().getSubcategoria() != null
                && turno.getVehiculo().getSubcategoria().getCategoria() != null) {
            categoriaId = turno.getVehiculo().getSubcategoria().getCategoria().getCategoriaid();
        }

        if (categoriaId != null) {
            var porCategoria = tarifarioRepository
                    .findByServicio_IdTipoTramiteAndEstadoAndCategoria_Categoriaid(servicioId, "ACTIVO", categoriaId);
            if (porCategoria.isPresent()) {
                return porCategoria.get().getTarifa();
            }
        }

        return tarifarioRepository
                .findByServicio_IdTipoTramiteAndEstadoAndCategoriaIsNull(servicioId, "ACTIVO")
                .map(TarifarioTramite::getTarifa)
                .orElse(null);
    }
    @Override
    @Transactional
    public TurnosDTO cambiarEstado(Long turnoId, String nuevoEstado) {
        if (!repository.existsById(turnoId)) {
            throw new RuntimeException("Turno no encontrado con ID: " + turnoId);
        }
        LocalDate fechaCancelado = LocalDate.now();
        int updated = repository.actualizarEstado(turnoId, nuevoEstado, fechaCancelado);
        if (updated == 0) {
            throw new RuntimeException("No se pudo actualizar el estado del turno con ID: " + turnoId);
        }
        auditoriaService.registrar("UPDATE", "Turnos", "Cambió estado de turno ID " + turnoId + " a " + nuevoEstado);
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

        // Métodos ya realizados: dentro del rango de fechas del turno (evita contaminar con otros turnos del mismo vehículo)
        LocalDate fi = turno.getFechaInicio();
        LocalDate ff = turno.getFechaFin();
        LocalDateTime desde = (fi != null ? fi : LocalDate.now()).atStartOfDay();
        LocalDateTime hasta = (ff != null ? ff.plusDays(1).atStartOfDay().minusNanos(1) : LocalDateTime.now());

        Set<Long> metodoIdsRealizados = detalleInspeccionRepository
                .findMetodoIdsRealizadosPorVehiculoYFecha(vehiculoId, desde, hasta)
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
        dto.setFechaPagado(turno.getFechaPagado());
        dto.setValidador(turno.getValidador());
        return dto;
    }
}