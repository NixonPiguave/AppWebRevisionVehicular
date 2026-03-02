package com.revisionvehicular.backend.service.srtv;

import com.revisionvehicular.backend.dtos.srtv.TurnosDTO;
import com.revisionvehicular.backend.entities.ant.EntidadesTransito;
import com.revisionvehicular.backend.entities.srtv.Turnos;
import com.revisionvehicular.backend.repositories.ant.IEntidadesTransitoRepository;
import com.revisionvehicular.backend.repositories.srtv.ITurnosRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TurnosServiceImpl implements ITurnosService {
    private final ITurnosRepository repository;
    private final IEntidadesTransitoRepository entidadesTransitoRepository;

    @Autowired
    public TurnosServiceImpl(
            ITurnosRepository repository,
            IEntidadesTransitoRepository entidadesTransitoRepository
    ) {
        this.repository = repository;
        this.entidadesTransitoRepository = entidadesTransitoRepository;
    }

    @Override
    public TurnosDTO save(TurnosDTO dto) {
        Long entidadId = normalizarEntidadId(dto.getEntidadId());
        Long tramiteId = null; // Se genera internamente en la capa RTV / BD

        // fechaFin / fechaCancelado se asignan vía SP (no desde el formulario)
        repository.insertarTurno(
                dto.getPropietarioId(),
                dto.getVehiculoId(),
                dto.getServicioId(),
                tramiteId,
                entidadId,
                dto.getFechaInicio(),
                null,
                null,
                dto.getEstado()
        );

        Turnos turno = repository.findAll().stream()
                .filter(t -> t.getPropietario() != null && t.getPropietario().getIdPropietario().equals(dto.getPropietarioId()) && t.getVehiculo() != null && t.getVehiculo().getVehiculoid().equals(dto.getVehiculoId()) && t.getFechaInicio().equals(dto.getFechaInicio()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Error al crear turno"));
        return toDTO(turno);
    }

    @Override
    public TurnosDTO findById(Long id) {
        Turnos turno = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado con ID: " + id));
        return toDTO(turno);
    }

    @Override
    public List<TurnosDTO> findAll() {
        return repository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public TurnosDTO update(Long id, TurnosDTO dto) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Turno no encontrado con ID: " + id);
        }

        Turnos existente = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado con ID: " + id));

        Long entidadId = existente.getEntidad() != null
                ? existente.getEntidad().getIdEntidad()
                : normalizarEntidadId(dto.getEntidadId());

        Long tramiteId = existente.getTramite() != null
                ? existente.getTramite().getIdTramite()
                : null;

        // fechaFin / fechaCancelado no se editan desde el formulario
        repository.actualizarTurno(
                id,
                dto.getPropietarioId(),
                dto.getVehiculoId(),
                dto.getServicioId(),
                tramiteId,
                entidadId,
                dto.getFechaInicio(),
                existente.getFechaFin(),
                existente.getFechaCancelado(),
                dto.getEstado()
        );

        Turnos turnoActualizado = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error al recuperar el turno actualizado"));
        return toDTO(turnoActualizado);
    }

    @Override
    public void delete(Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
        } else {
            throw new RuntimeException("El turno no existe");
        }
    }

    private TurnosDTO toDTO(Turnos turno) {
        TurnosDTO dto = new TurnosDTO();
        dto.setTurnoId(turno.getTurnoId());
        dto.setPropietarioId(turno.getPropietario() != null ? turno.getPropietario().getIdPropietario() : null);
        dto.setVehiculoId(turno.getVehiculo() != null ? turno.getVehiculo().getVehiculoid() : null);
        dto.setServicioId(turno.getServicio() != null ? turno.getServicio().getIdTipoTramite() : null);
        dto.setTramiteId(turno.getTramite() != null ? turno.getTramite().getIdTramite() : null);
        dto.setEntidadId(turno.getEntidad() != null ? turno.getEntidad().getIdEntidad() : null);
        dto.setFechaInicio(turno.getFechaInicio());
        dto.setFechaFin(turno.getFechaFin());
        dto.setFechaCancelado(turno.getFechaCancelado());
        dto.setEstado(turno.getEstado());
        return dto;
    }

    private Long normalizarEntidadId(Long entidadId) {
        if (entidadId != null && entidadId > 0) {
            return entidadId;
        }
        return entidadesTransitoRepository.findAll()
                .stream()
                .findFirst()
                .map(EntidadesTransito::getIdEntidad)
                .orElseThrow(() -> new RuntimeException("No existe entidad de tránsito para asignar al turno"));
    }
}