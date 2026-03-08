package com.revisionvehicular.backend.service.bund;

import com.revisionvehicular.backend.dtos.bund.IncidenteDTO;
import com.revisionvehicular.backend.entities.bund.Incidente;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import com.revisionvehicular.backend.repositories.bund.IIncidenteRepository;
import com.revisionvehicular.backend.repositories.ant.IEntidadesTransitoRepository;
import com.revisionvehicular.backend.repositories.cv.IVehiculoRepository;
import com.revisionvehicular.backend.repositories.rtv.ITramiteMatriculacionRepository;
import com.revisionvehicular.backend.repositories.srtv.IUsuarioRepository;
import com.revisionvehicular.backend.service.srtv.AuditoriaService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class IncidenteServiceImpl implements IIncidenteService {

    private final IIncidenteRepository repository;
    private final ITramiteMatriculacionRepository tramiteRepository;
    private final IVehiculoRepository vehiculoRepository;
    private final IEntidadesTransitoRepository entidadRepository;
    private final IUsuarioRepository usuarioRepository;
    private final AuditoriaService auditoriaService;

    public IncidenteServiceImpl(IIncidenteRepository repository,
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

    private IncidenteDTO toDTO(Incidente e) {
        IncidenteDTO dto = new IncidenteDTO();
        dto.setIdIncidente(e.getIdIncidente());
        dto.setNumeroIncidente(e.getNumeroIncidente());
        dto.setTipoIncidente(e.getTipoIncidente());
        dto.setDescripcion(e.getDescripcion());
        dto.setDocumentosSoporte(e.getDocumentosSoporte());
        dto.setAreaResponsable(e.getAreaResponsable());
        dto.setResolucion(e.getResolucion());
        dto.setEstado(e.getEstado());
        dto.setFechaRegistro(e.getFechaRegistro());
        dto.setFechaResolucion(e.getFechaResolucion());
        if (e.getTramite() != null) dto.setTramiteId(e.getTramite().getIdTramite());
        if (e.getVehiculo() != null) dto.setVehiculoId(e.getVehiculo().getVehiculoid());
        if (e.getUsuarioReporta() != null) dto.setUsuarioReportaId(e.getUsuarioReporta().getUsuarioId());
        if (e.getUsuarioResuelve() != null) dto.setUsuarioResuelveId(e.getUsuarioResuelve().getUsuarioId());
        if (e.getEntidad() != null) dto.setEntidadId(e.getEntidad().getIdEntidad());
        return dto;
    }

    @Override
    @Transactional
    public IncidenteDTO save(IncidenteDTO dto) {
        if (dto.getEntidadId() == null) {
            throw new IllegalArgumentException("La entidad de tránsito es obligatoria.");
        }
        Long usuarioId = dto.getUsuarioReportaId();
        if (usuarioId == null) {
            usuarioId = auditoriaService.getUsuarioActual()
                    .map(Usuario::getUsuarioId)
                    .orElse(null);
        }
        if (usuarioId == null) {
            throw new IllegalArgumentException("No se pudo determinar el usuario. Debe iniciar sesión.");
        }

        Incidente entity = new Incidente();
        entity.setNumeroIncidente(dto.getNumeroIncidente() != null ? dto.getNumeroIncidente() : "INC-" + System.currentTimeMillis());
        entity.setTipoIncidente(dto.getTipoIncidente() != null ? dto.getTipoIncidente() : "GENERAL");
        entity.setDescripcion(dto.getDescripcion() != null ? dto.getDescripcion() : "");
        entity.setDocumentosSoporte(dto.getDocumentosSoporte());
        entity.setAreaResponsable(dto.getAreaResponsable());
        entity.setResolucion(dto.getResolucion());
        entity.setEstado(dto.getEstado() != null ? dto.getEstado() : "ABIERTO");
        entity.setFechaRegistro(dto.getFechaRegistro() != null ? dto.getFechaRegistro() : LocalDateTime.now());
        entity.setFechaResolucion(dto.getFechaResolucion());

        if (dto.getTramiteId() != null) {
            entity.setTramite(tramiteRepository.findById(dto.getTramiteId()).orElse(null));
        }
        if (dto.getVehiculoId() != null) {
            entity.setVehiculo(vehiculoRepository.findById(dto.getVehiculoId()).orElse(null));
        }
        entity.setEntidad(entidadRepository.findById(dto.getEntidadId()).orElseThrow(() -> new IllegalArgumentException("Entidad no encontrada")));
        entity.setUsuarioReporta(usuarioRepository.findById(usuarioId).orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado")));
        if (dto.getUsuarioResuelveId() != null) {
            entity.setUsuarioResuelve(usuarioRepository.findById(dto.getUsuarioResuelveId()).orElse(null));
        }

        Incidente guardado = repository.save(entity);
        auditoriaService.registrar("INSERT", "Incidente", "Registró incidente " + guardado.getNumeroIncidente());
        return toDTO(guardado);
    }

    @Override
    @Transactional
    public IncidenteDTO update(Long id, IncidenteDTO dto) {
        Incidente entity = repository.findById(id).orElseThrow(() -> new RuntimeException("Incidente no encontrado con ID: " + id));
        entity.setNumeroIncidente(dto.getNumeroIncidente());
        entity.setTipoIncidente(dto.getTipoIncidente());
        entity.setDescripcion(dto.getDescripcion());
        entity.setDocumentosSoporte(dto.getDocumentosSoporte());
        entity.setAreaResponsable(dto.getAreaResponsable());
        entity.setResolucion(dto.getResolucion());
        entity.setEstado(dto.getEstado());
        entity.setFechaResolucion(dto.getFechaResolucion());
        if (dto.getTramiteId() != null) entity.setTramite(tramiteRepository.findById(dto.getTramiteId()).orElse(null));
        if (dto.getVehiculoId() != null) entity.setVehiculo(vehiculoRepository.findById(dto.getVehiculoId()).orElse(null));
        if (dto.getEntidadId() != null) entity.setEntidad(entidadRepository.findById(dto.getEntidadId()).orElse(null));
        if (dto.getUsuarioResuelveId() != null) entity.setUsuarioResuelve(usuarioRepository.findById(dto.getUsuarioResuelveId()).orElse(null));
        Incidente actualizado = repository.save(entity);
        auditoriaService.registrar("UPDATE", "Incidente", "Actualizó incidente " + id);
        return toDTO(actualizado);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) throw new RuntimeException("Incidente no encontrado con ID: " + id);
        repository.deleteById(id);
        auditoriaService.registrar("DELETE", "Incidente", "Eliminó incidente " + id);
    }

    @Override
    public IncidenteDTO findById(Long id) {
        return toDTO(repository.findById(id).orElseThrow(() -> new RuntimeException("Incidente no encontrado con ID: " + id)));
    }

    @Override
    public List<IncidenteDTO> findAll() {
        return repository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }
}
