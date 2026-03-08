package com.revisionvehicular.backend.service.rtv;

import com.revisionvehicular.backend.dtos.rtv.DesbloqueoVehiculoDTO;
import com.revisionvehicular.backend.entities.rtv.DesbloqueoVehiculo;
import com.revisionvehicular.backend.repositories.rtv.IDesbloqueoVehiculoRepository;
import com.revisionvehicular.backend.service.srtv.AuditoriaService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DesbloqueoVehiculoServiceImpl implements IDesbloqueoVehiculoService {

    private final IDesbloqueoVehiculoRepository repository;
    private final AuditoriaService auditoriaService;

    public DesbloqueoVehiculoServiceImpl(IDesbloqueoVehiculoRepository repository, AuditoriaService auditoriaService) {
        this.repository = repository;
        this.auditoriaService = auditoriaService;
    }

    private DesbloqueoVehiculoDTO toDTO(DesbloqueoVehiculo entity) {
        DesbloqueoVehiculoDTO dto = new DesbloqueoVehiculoDTO();
        dto.setIdDesbloqueo(entity.getIdDesbloqueo());
        dto.setNumeroTramite(entity.getNumeroTramite());
        dto.setDocumentoLevantamiento(entity.getDocumentoLevantamiento());
        dto.setMotivoLevantamiento(entity.getMotivoLevantamiento());
        dto.setFechaDesactivacion(entity.getFechaDesactivacion());
        dto.setEstado(entity.getEstado());

        if (entity.getTramite() != null) {
            dto.setTramiteId(entity.getTramite().getIdTramite());
        }
        if (entity.getBloqueo() != null) {
            dto.setBloqueoId(entity.getBloqueo().getIdBloqueoSrv());
        }
        if (entity.getVehiculo() != null) {
            dto.setVehiculoId(entity.getVehiculo().getVehiculoid());
        }
        if (entity.getEntidad() != null) {
            dto.setEntidadId(entity.getEntidad().getIdEntidad());
        }
        if (entity.getUsuarioDesactiva() != null) {
            dto.setUsuarioDesactivaId(entity.getUsuarioDesactiva().getUsuarioId());
        }

        return dto;
    }

    @Override
    public DesbloqueoVehiculoDTO save(DesbloqueoVehiculoDTO dto) {
        repository.insertarDesbloqueoVehiculo(
                dto.getTramiteId(),
                dto.getBloqueoId(),
                dto.getVehiculoId(),
                dto.getEntidadId(),
                dto.getUsuarioDesactivaId(),
                dto.getNumeroTramite(),
                dto.getDocumentoLevantamiento(),
                dto.getMotivoLevantamiento(),
                dto.getFechaDesactivacion(),
                dto.getEstado()
        );

        DesbloqueoVehiculo creado = repository.findAll().stream()
                .filter(d -> d.getNumeroTramite().equals(dto.getNumeroTramite()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Error al insertar desbloqueo de vehículo"));
        auditoriaService.registrar("INSERT", "DesbloqueoVehiculo", "Registró desbloqueo trámite " + dto.getNumeroTramite());
        return toDTO(creado);
    }

    @Override
    public DesbloqueoVehiculoDTO update(Long id, DesbloqueoVehiculoDTO dto) {
        DesbloqueoVehiculo existente = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Desbloqueo no encontrado con ID: " + id));

        repository.actualizarDesbloqueoVehiculo(
            id,
            dto.getTramiteId(),
            dto.getBloqueoId(),
            dto.getVehiculoId(),
            dto.getEntidadId(),
            dto.getUsuarioDesactivaId(),
            dto.getNumeroTramite(),
            dto.getDocumentoLevantamiento(),
            dto.getMotivoLevantamiento(),
            dto.getFechaDesactivacion(),
            dto.getEstado()
        );

        DesbloqueoVehiculo actualizado = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error al actualizar desbloqueo de vehículo"));
        auditoriaService.registrar("UPDATE", "DesbloqueoVehiculo", "Actualizó desbloqueo ID " + id);
        return toDTO(actualizado);
    }

    @Override
    public void delete(Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            auditoriaService.registrar("DELETE", "DesbloqueoVehiculo", "Eliminó desbloqueo ID " + id);
        } else {
            throw new RuntimeException("El desbloqueo de vehículo no existe");
        }
    }

    @Override
    public DesbloqueoVehiculoDTO findById(Long id) {
        DesbloqueoVehiculo entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Desbloqueo no encontrado con ID: " + id));
        return toDTO(entity);
    }

    @Override
    public List<DesbloqueoVehiculoDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}

