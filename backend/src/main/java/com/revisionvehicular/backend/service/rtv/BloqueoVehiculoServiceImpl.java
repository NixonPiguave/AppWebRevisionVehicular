package com.revisionvehicular.backend.service.rtv;

import com.revisionvehicular.backend.dtos.rtv.BloqueoVehiculoDTO;
import com.revisionvehicular.backend.entities.rtv.BloqueoVehiculo;
import com.revisionvehicular.backend.repositories.rtv.IBloqueoVehiculoRepository;
import com.revisionvehicular.backend.service.srtv.AuditoriaService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BloqueoVehiculoServiceImpl implements IBloqueoVehiculoService {

    private final IBloqueoVehiculoRepository repository;
    private final AuditoriaService auditoriaService;

    public BloqueoVehiculoServiceImpl(IBloqueoVehiculoRepository repository, AuditoriaService auditoriaService) {
        this.repository = repository;
        this.auditoriaService = auditoriaService;
    }

    private BloqueoVehiculoDTO toDTO(BloqueoVehiculo entity) {
        BloqueoVehiculoDTO dto = new BloqueoVehiculoDTO();
        dto.setIdBloqueoSrv(entity.getIdBloqueoSrv());
        dto.setNumeroTramite(entity.getNumeroTramite());
        dto.setMotivo(entity.getMotivo());
        dto.setProcesosBloqueados(entity.getProcesosBloqueados());
        dto.setDocumentoHabilitante(entity.getDocumentoHabilitante());
        dto.setInstitucionOrigen(entity.getInstitucionOrigen());
        dto.setFechaActivacion(entity.getFechaActivacion());
        dto.setEstado(entity.getEstado());
        dto.setObservaciones(entity.getObservaciones());

        if (entity.getVehiculo() != null) {
            dto.setVehiculoId(entity.getVehiculo().getVehiculoid());
        }
        if (entity.getEntidad() != null) {
            dto.setEntidadId(entity.getEntidad().getIdEntidad());
        }
        if (entity.getUsuarioActiva() != null) {
            dto.setUsuarioActivaId(entity.getUsuarioActiva().getUsuarioId());
        }
        if (entity.getTipoBloqueo() != null) {
            dto.setTipoBloqueoId(entity.getTipoBloqueo().getIdTipoBloqueo());
        }

        return dto;
    }

    @Override
    public BloqueoVehiculoDTO save(BloqueoVehiculoDTO dto) {
        if (dto.getUsuarioActivaId() == null) {
            auditoriaService.getUsuarioActual()
                    .map(u -> u.getUsuarioId())
                    .ifPresent(dto::setUsuarioActivaId);
        }
        if (dto.getUsuarioActivaId() == null) {
            throw new RuntimeException("Debe iniciar sesión para registrar un bloqueo de vehículo.");
        }
        repository.insertarBloqueoVehiculo(
                dto.getVehiculoId(),
                dto.getEntidadId(),
                dto.getUsuarioActivaId(),
                dto.getNumeroTramite(),
                dto.getTipoBloqueoId(),
                dto.getMotivo(),
                dto.getProcesosBloqueados(),
                dto.getDocumentoHabilitante(),
                dto.getInstitucionOrigen(),
                dto.getFechaActivacion(),
                dto.getEstado(),
                dto.getObservaciones()
        );

        BloqueoVehiculo creado = repository.findAll().stream()
                .filter(b -> b.getNumeroTramite().equals(dto.getNumeroTramite()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Error al insertar bloqueo de vehículo"));
        auditoriaService.registrar("INSERT", "BloqueoVehiculo", "Registró bloqueo trámite " + dto.getNumeroTramite());
        return toDTO(creado);
    }

    @Override
    public BloqueoVehiculoDTO update(Long id, BloqueoVehiculoDTO dto) {
        BloqueoVehiculo existente = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bloqueo no encontrado con ID: " + id));
        if (dto.getUsuarioActivaId() == null) {
            auditoriaService.getUsuarioActual()
                    .map(u -> u.getUsuarioId())
                    .ifPresent(dto::setUsuarioActivaId);
        }
        if (dto.getUsuarioActivaId() == null) {
            throw new RuntimeException("Debe iniciar sesión para actualizar un bloqueo de vehículo.");
        }
        repository.actualizarBloqueoVehiculo(
                id,
                dto.getVehiculoId(),
                dto.getEntidadId(),
                dto.getUsuarioActivaId(),
                dto.getNumeroTramite(),
                dto.getTipoBloqueoId(),
                dto.getMotivo(),
                dto.getProcesosBloqueados(),
                dto.getDocumentoHabilitante(),
                dto.getInstitucionOrigen(),
                dto.getFechaActivacion(),
                dto.getEstado(),
                dto.getObservaciones()
        );

        BloqueoVehiculo actualizado = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error al actualizar bloqueo de vehículo"));
        auditoriaService.registrar("UPDATE", "BloqueoVehiculo", "Actualizó bloqueo ID " + id);
        return toDTO(actualizado);
    }

    @Override
    public void delete(Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            auditoriaService.registrar("DELETE", "BloqueoVehiculo", "Eliminó bloqueo ID " + id);
        } else {
            throw new RuntimeException("El bloqueo de vehículo no existe");
        }
    }

    @Override
    public BloqueoVehiculoDTO findById(Long id) {
        BloqueoVehiculo entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bloqueo no encontrado con ID: " + id));
        return toDTO(entity);
    }

    @Override
    public List<BloqueoVehiculoDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}

