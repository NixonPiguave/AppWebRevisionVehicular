package com.revisionvehicular.backend.service.rtv;

import com.revisionvehicular.backend.dtos.rtv.RegistroObservacionDTO;
import com.revisionvehicular.backend.entities.ant.EntidadesTransito;
import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.rtv.RegistroObservacion;
import com.revisionvehicular.backend.entities.rtv.TramiteMatriculacion;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import com.revisionvehicular.backend.repositories.ant.IEntidadesTransitoRepository;
import com.revisionvehicular.backend.repositories.cv.IVehiculoRepository;
import com.revisionvehicular.backend.repositories.rtv.IRegistroObservacionRepository;
import com.revisionvehicular.backend.repositories.rtv.ITramiteMatriculacionRepository;
import com.revisionvehicular.backend.repositories.srtv.IUsuarioRepository;
import com.revisionvehicular.backend.service.srtv.AuditoriaService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RegistroObservacionServiceImpl implements IRegistroObservacionService {

    private final IRegistroObservacionRepository repository;
    private final ITramiteMatriculacionRepository tramiteRepository;
    private final IVehiculoRepository vehiculoRepository;
    private final IEntidadesTransitoRepository entidadRepository;
    private final IUsuarioRepository usuarioRepository;
    private final AuditoriaService auditoriaService;

    public RegistroObservacionServiceImpl(IRegistroObservacionRepository repository,
                                           ITramiteMatriculacionRepository tramiteRepository,
                                           IVehiculoRepository vehiculoRepository,
                                           IEntidadesTransitoRepository entidadRepository,
                                           IUsuarioRepository usuarioRepository,
                                           AuditoriaService auditoriaService) {
        this.repository = repository;
        this.tramiteRepository = tramiteRepository;
        this.vehiculoRepository = vehiculoRepository;
        this.entidadRepository = entidadRepository;
        this.usuarioRepository = usuarioRepository;
        this.auditoriaService = auditoriaService;
    }

    private RegistroObservacionDTO toDTO(RegistroObservacion e) {
        RegistroObservacionDTO dto = new RegistroObservacionDTO();
        dto.setIdObservacionSrv(e.getIdObservacionSrv());
        dto.setNumeroTramite(e.getNumeroTramite());
        dto.setTipoObservacion(e.getTipoObservacion());
        dto.setDescripcion(e.getDescripcion());
        dto.setDocumentoSoporte(e.getDocumentoSoporte());
        dto.setGeneraBloqueoCoby(e.getGeneraBloqueoCoby());
        dto.setEstado(e.getEstado());
        dto.setFechaRegistro(e.getFechaRegistro());
        dto.setFechaLevantamiento(e.getFechaLevantamiento());
        dto.setMotivoLevantamiento(e.getMotivoLevantamiento());
        if (e.getTramite() != null) dto.setTramiteId(e.getTramite().getIdTramite());
        if (e.getVehiculo() != null) dto.setVehiculoId(e.getVehiculo().getVehiculoid());
        if (e.getEntidad() != null) dto.setEntidadId(e.getEntidad().getIdEntidad());
        if (e.getUsuario() != null) dto.setUsuarioId(e.getUsuario().getUsuarioId());
        if (e.getBloqueoCoby() != null) dto.setBloqueoCobyId(e.getBloqueoCoby().getIdBloqueoSrv());
        return dto;
    }

    @Override
    @Transactional
    public RegistroObservacionDTO save(RegistroObservacionDTO dto) {
        if (dto.getVehiculoId() == null || dto.getEntidadId() == null) {
            throw new IllegalArgumentException("Vehículo y entidad de tránsito son obligatorios.");
        }
        Long usuarioId = dto.getUsuarioId();
        if (usuarioId == null) {
            usuarioId = auditoriaService.getUsuarioActual()
                    .map(Usuario::getUsuarioId)
                    .orElse(null);
        }
        if (usuarioId == null) {
            throw new IllegalArgumentException("No se pudo determinar el usuario. Debe iniciar sesión.");
        }

        RegistroObservacion entity = new RegistroObservacion();
        entity.setNumeroTramite(dto.getNumeroTramite() != null ? dto.getNumeroTramite() : "OBS-" + System.currentTimeMillis());
        entity.setTipoObservacion(dto.getTipoObservacion() != null ? dto.getTipoObservacion() : "CAMBIO_MOTOR");
        entity.setDescripcion(dto.getDescripcion() != null ? dto.getDescripcion() : "");
        entity.setDocumentoSoporte(dto.getDocumentoSoporte() != null ? dto.getDocumentoSoporte() : "");
        entity.setGeneraBloqueoCoby(dto.getGeneraBloqueoCoby() != null ? dto.getGeneraBloqueoCoby() : "NO");
        entity.setEstado(dto.getEstado() != null ? dto.getEstado() : "ACTIVA");
        entity.setFechaRegistro(dto.getFechaRegistro() != null ? dto.getFechaRegistro() : java.time.LocalDateTime.now());
        entity.setFechaLevantamiento(dto.getFechaLevantamiento());
        entity.setMotivoLevantamiento(dto.getMotivoLevantamiento());

        if (dto.getTramiteId() != null) {
            entity.setTramite(tramiteRepository.findById(dto.getTramiteId()).orElseThrow(() -> new IllegalArgumentException("Trámite no encontrado")));
        }
        // Si la tabla rtv_observacion_vehiculo_srv permite id_tramite NULL, no es obligatorio; si no, ejecutar script rtv_observacion_id_tramite_null.sql
        entity.setVehiculo(vehiculoRepository.findById(dto.getVehiculoId()).orElseThrow(() -> new IllegalArgumentException("Vehículo no encontrado")));
        entity.setEntidad(entidadRepository.findById(dto.getEntidadId()).orElseThrow(() -> new IllegalArgumentException("Entidad no encontrada")));
        entity.setUsuario(usuarioRepository.findById(usuarioId).orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado")));

        RegistroObservacion guardado = repository.save(entity);
        auditoriaService.registrar("INSERT", "RegistroObservacion", "Registró observación " + guardado.getNumeroTramite());
        return toDTO(guardado);
    }

    @Override
    @Transactional
    public RegistroObservacionDTO update(Long id, RegistroObservacionDTO dto) {
        RegistroObservacion entity = repository.findById(id).orElseThrow(() -> new RuntimeException("Observación no encontrada con ID: " + id));
        entity.setNumeroTramite(dto.getNumeroTramite());
        entity.setTipoObservacion(dto.getTipoObservacion());
        entity.setDescripcion(dto.getDescripcion());
        entity.setDocumentoSoporte(dto.getDocumentoSoporte());
        entity.setGeneraBloqueoCoby(dto.getGeneraBloqueoCoby());
        entity.setEstado(dto.getEstado());
        entity.setFechaLevantamiento(dto.getFechaLevantamiento());
        entity.setMotivoLevantamiento(dto.getMotivoLevantamiento());
        if (dto.getTramiteId() != null) {
            entity.setTramite(tramiteRepository.findById(dto.getTramiteId()).orElse(null));
        }
        if (dto.getVehiculoId() != null) {
            entity.setVehiculo(vehiculoRepository.findById(dto.getVehiculoId()).orElse(null));
        }
        if (dto.getEntidadId() != null) {
            entity.setEntidad(entidadRepository.findById(dto.getEntidadId()).orElse(null));
        }
        RegistroObservacion actualizado = repository.save(entity);
        auditoriaService.registrar("UPDATE", "RegistroObservacion", "Actualizó observación " + id);
        return toDTO(actualizado);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Observación no encontrada con ID: " + id);
        }
        repository.deleteById(id);
        auditoriaService.registrar("DELETE", "RegistroObservacion", "Eliminó observación " + id);
    }

    @Override
    public RegistroObservacionDTO findById(Long id) {
        return toDTO(repository.findById(id).orElseThrow(() -> new RuntimeException("Observación no encontrada con ID: " + id)));
    }

    @Override
    public List<RegistroObservacionDTO> findAll() {
        return repository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }
}
