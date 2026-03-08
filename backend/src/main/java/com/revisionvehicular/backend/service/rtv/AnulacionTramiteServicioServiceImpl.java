package com.revisionvehicular.backend.service.rtv;

import com.revisionvehicular.backend.dtos.rtv.AnulacionTramiteServicioDTO;
import com.revisionvehicular.backend.entities.rtv.AnulacionTramiteServicio;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import com.revisionvehicular.backend.repositories.rtv.IAnulacionTramiteServicioRepository;
import com.revisionvehicular.backend.repositories.ant.IEntidadesTransitoRepository;
import com.revisionvehicular.backend.repositories.rtv.ITramiteMatriculacionRepository;
import com.revisionvehicular.backend.repositories.srtv.IUsuarioRepository;
import com.revisionvehicular.backend.service.srtv.AuditoriaService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AnulacionTramiteServicioServiceImpl implements IAnulacionTramiteServicioService {

    private final IAnulacionTramiteServicioRepository repository;
    private final ITramiteMatriculacionRepository tramiteRepository;
    private final IEntidadesTransitoRepository entidadRepository;
    private final IUsuarioRepository usuarioRepository;
    private final AuditoriaService auditoriaService;

    public AnulacionTramiteServicioServiceImpl(IAnulacionTramiteServicioRepository repository,
                                              ITramiteMatriculacionRepository tramiteRepository,
                                              IEntidadesTransitoRepository entidadRepository,
                                              IUsuarioRepository usuarioRepository,
                                              AuditoriaService auditoriaService) {
        this.repository = repository;
        this.tramiteRepository = tramiteRepository;
        this.entidadRepository = entidadRepository;
        this.usuarioRepository = usuarioRepository;
        this.auditoriaService = auditoriaService;
    }

    private AnulacionTramiteServicioDTO toDTO(AnulacionTramiteServicio e) {
        AnulacionTramiteServicioDTO dto = new AnulacionTramiteServicioDTO();
        dto.setIdAnulacionSrv(e.getIdAnulacionSrv());
        dto.setNumeroTramiteAnulado(e.getNumeroTramiteAnulado());
        dto.setEstadoTramiteAlAnular(e.getEstadoTramiteAlAnular());
        dto.setMotivoAnulacion(e.getMotivoAnulacion());
        dto.setDocumentosSoporte(e.getDocumentosSoporte());
        dto.setPagosRevertidos(e.getPagosRevertidos());
        dto.setMultasDevueltas(e.getMultasDevueltas());
        dto.setEstado(e.getEstado());
        dto.setFechaAnulacion(e.getFechaAnulacion());
        if (e.getTramiteAnulado() != null) dto.setTramiteAnuladoId(e.getTramiteAnulado().getIdTramite());
        if (e.getEntidad() != null) dto.setEntidadId(e.getEntidad().getIdEntidad());
        if (e.getUsuario() != null) dto.setUsuarioId(e.getUsuario().getUsuarioId());
        return dto;
    }

    @Override
    @Transactional
    public AnulacionTramiteServicioDTO save(AnulacionTramiteServicioDTO dto) {
        if (dto.getTramiteAnuladoId() == null && (dto.getNumeroTramiteAnulado() == null || dto.getNumeroTramiteAnulado().isBlank())) {
            throw new IllegalArgumentException("Debe indicar el trámite a anular (ID o número de trámite).");
        }
        if (dto.getEntidadId() == null) {
            throw new IllegalArgumentException("La entidad de tránsito es obligatoria.");
        }
        Long usuarioId = dto.getUsuarioId();
        if (usuarioId == null) {
            usuarioId = auditoriaService.getUsuarioActual().map(Usuario::getUsuarioId).orElse(null);
        }
        if (usuarioId == null) {
            throw new IllegalArgumentException("No se pudo determinar el usuario. Debe iniciar sesión.");
        }

        AnulacionTramiteServicio entity = new AnulacionTramiteServicio();
        entity.setNumeroTramiteAnulado(dto.getNumeroTramiteAnulado() != null ? dto.getNumeroTramiteAnulado() : "");
        entity.setEstadoTramiteAlAnular(dto.getEstadoTramiteAlAnular() != null ? dto.getEstadoTramiteAlAnular() : "EN_PROCESO");
        entity.setMotivoAnulacion(dto.getMotivoAnulacion() != null ? dto.getMotivoAnulacion() : "");
        entity.setDocumentosSoporte(dto.getDocumentosSoporte());
        entity.setPagosRevertidos(dto.getPagosRevertidos() != null ? dto.getPagosRevertidos() : "NO");
        entity.setMultasDevueltas(dto.getMultasDevueltas() != null ? dto.getMultasDevueltas() : "NO");
        entity.setEstado(dto.getEstado() != null ? dto.getEstado() : "ANULADO");
        entity.setFechaAnulacion(dto.getFechaAnulacion() != null ? dto.getFechaAnulacion() : LocalDateTime.now());

        if (dto.getTramiteAnuladoId() != null) {
            entity.setTramiteAnulado(tramiteRepository.findById(dto.getTramiteAnuladoId())
                    .orElseThrow(() -> new IllegalArgumentException("Trámite no encontrado")));
            if (entity.getNumeroTramiteAnulado() == null || entity.getNumeroTramiteAnulado().isBlank()) {
                entity.setNumeroTramiteAnulado(entity.getTramiteAnulado().getNumeroTramite());
            }
        } else {
            throw new IllegalArgumentException("El trámite a anular (ID) es obligatorio.");
        }
        entity.setEntidad(entidadRepository.findById(dto.getEntidadId()).orElseThrow(() -> new IllegalArgumentException("Entidad no encontrada")));
        entity.setUsuario(usuarioRepository.findById(usuarioId).orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado")));

        AnulacionTramiteServicio guardado = repository.save(entity);
        auditoriaService.registrar("INSERT", "AnulacionTramiteServicio", "Anuló trámite " + guardado.getNumeroTramiteAnulado());
        return toDTO(guardado);
    }

    @Override
    @Transactional
    public AnulacionTramiteServicioDTO update(Long id, AnulacionTramiteServicioDTO dto) {
        AnulacionTramiteServicio entity = repository.findById(id).orElseThrow(() -> new RuntimeException("Anulación no encontrada con ID: " + id));
        entity.setMotivoAnulacion(dto.getMotivoAnulacion());
        entity.setDocumentosSoporte(dto.getDocumentosSoporte());
        entity.setPagosRevertidos(dto.getPagosRevertidos());
        entity.setMultasDevueltas(dto.getMultasDevueltas());
        if (dto.getEntidadId() != null) entity.setEntidad(entidadRepository.findById(dto.getEntidadId()).orElse(null));
        AnulacionTramiteServicio actualizado = repository.save(entity);
        return toDTO(actualizado);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) throw new RuntimeException("Anulación no encontrada con ID: " + id);
        repository.deleteById(id);
        auditoriaService.registrar("DELETE", "AnulacionTramiteServicio", "Eliminó registro anulación " + id);
    }

    @Override
    public AnulacionTramiteServicioDTO findById(Long id) {
        return toDTO(repository.findById(id).orElseThrow(() -> new RuntimeException("Anulación no encontrada con ID: " + id)));
    }

    @Override
    public List<AnulacionTramiteServicioDTO> findAll() {
        return repository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }
}
