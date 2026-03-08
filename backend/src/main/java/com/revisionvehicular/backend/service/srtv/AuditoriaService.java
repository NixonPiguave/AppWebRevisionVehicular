package com.revisionvehicular.backend.service.srtv;

import com.revisionvehicular.backend.dtos.srtv.AuditoriaDTO;
import com.revisionvehicular.backend.entities.srtv.Auditoria;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import com.revisionvehicular.backend.repositories.srtv.IAuditoriaRepository;
import com.revisionvehicular.backend.repositories.srtv.IUsuarioRepository;
import com.revisionvehicular.backend.repositories.srtv.IUsuarioRolesRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AuditoriaService {

    private final IAuditoriaRepository auditoriaRepository;
    private final IUsuarioRepository usuarioRepository;
    private final IUsuarioRolesRepository usuarioRolesRepository;

    public AuditoriaService(IAuditoriaRepository auditoriaRepository,
                            IUsuarioRepository usuarioRepository,
                            IUsuarioRolesRepository usuarioRolesRepository) {
        this.auditoriaRepository = auditoriaRepository;
        this.usuarioRepository = usuarioRepository;
        this.usuarioRolesRepository = usuarioRolesRepository;
    }

    /** Registra una acción de auditoría (ej. login/logout) con el usuario explícito. */
    public void registrarAccion(Usuario usuario, String accion) {
        Auditoria auditoria = new Auditoria();
        auditoria.setFecha(LocalDateTime.now());
        auditoria.setUsuario(usuario);
        auditoria.setAccion(accion);
        auditoria.setTipoAccion(accion);
        auditoria.setEntidad(null);
        auditoria.setDetalle(accion);
        auditoriaRepository.save(auditoria);
    }

    /**
     * Registra una acción de auditoría usando el usuario actual del SecurityContext.
     * Tipo: INSERT, UPDATE, DELETE. Entidad: ej. "Usuario", "Marca". Detalle: descripción legible.
     */
    public void registrar(String tipoAccion, String entidad, String detalle) {
        Optional<Usuario> usuarioOpt = obtenerUsuarioActual();
        if (usuarioOpt.isEmpty()) return;

        String accion = tipoAccion + " en " + entidad + ": " + detalle;
        Auditoria auditoria = new Auditoria();
        auditoria.setFecha(LocalDateTime.now());
        auditoria.setUsuario(usuarioOpt.get());
        auditoria.setAccion(accion);
        auditoria.setTipoAccion(tipoAccion);
        auditoria.setEntidad(entidad);
        auditoria.setDetalle(detalle);
        auditoriaRepository.save(auditoria);
    }

    private Optional<Usuario> obtenerUsuarioActual() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) return Optional.empty();
        String username = auth.getPrincipal().toString();
        return usuarioRepository.findByUsuario(username);
    }

    private AuditoriaDTO toDTO(Auditoria a) {
        AuditoriaDTO dto = new AuditoriaDTO();
        dto.setAuditoriaId(a.getAuditoriaId());
        dto.setAccion(a.getAccion());
        dto.setTipoAccion(a.getTipoAccion());
        dto.setEntidad(a.getEntidad());
        dto.setDetalle(a.getDetalle());
        dto.setFecha(a.getFecha());
        dto.setUsuarioId(a.getUsuario().getUsuarioId());
        dto.setNombreUsuario(a.getUsuario().getUsuario());
        dto.setNombreCompleto(a.getUsuario().getNombre() + " " + a.getUsuario().getApellido());
        return dto;
    }

    public List<AuditoriaDTO> listarTodas() {
        return auditoriaRepository.findAllByOrderByFechaDesc().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<AuditoriaDTO> listarPorUsuario(Long usuarioId) {
        return auditoriaRepository.findByUsuario_UsuarioIdOrderByFechaDesc(usuarioId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<AuditoriaDTO> listarPorRol(Long rolId) {
        List<Long> usuarioIds = usuarioRolesRepository.findByRol_RolId(rolId).stream()
                .map(ur -> ur.getUsuario().getUsuarioId())
                .collect(Collectors.toList());
        if (usuarioIds.isEmpty()) return List.of();
        return auditoriaRepository.findByUsuario_UsuarioIdInOrderByFechaDesc(usuarioIds).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}