package com.revisionvehicular.backend.service.srtv;

import com.revisionvehicular.backend.dtos.srtv.TurnosDTO;
import com.revisionvehicular.backend.entities.srtv.Turnos;
import com.revisionvehicular.backend.repositories.srtv.ITurnosRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TurnosServiceImpl implements ITurnosService {

    private final ITurnosRepository repository;

    @Autowired
    public TurnosServiceImpl(ITurnosRepository repository) {
        this.repository = repository;
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

        return repository.findAll().stream()
                .filter(t -> t.getPropietario() != null
                        && t.getPropietario().getIdPropietario().equals(dto.getPropietarioId())
                        && t.getVehiculo() != null
                        && t.getVehiculo().getVehiculoid().equals(dto.getVehiculoId())
                        && t.getFechaInicio().equals(dto.getFechaInicio()))
                .findFirst()
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Error al crear turno"));
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

        return toDTO(repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error al recuperar el turno actualizado")));
    }

    @Override
    public void delete(Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
        } else {
            throw new RuntimeException("El turno no existe");
        }
    }

    @Override
    public List<TurnosDTO> findTurnosPagados() {
        return repository.findByEstadoOrderByFechaInicioDesc("PAGADO")
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
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
        return dto;
    }
}