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

    /** Límite de la columna {@code accion} en {@code srtv_auditoria} (entidad JPA). */
    private static final int MAX_ACCION_LENGTH = 500;
    /** Límite de la columna {@code detalle} en {@code srtv_auditoria} (entidad JPA). */
    private static final int MAX_DETALLE_LENGTH = 1000;

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
        String texto = accion != null ? accion : "";
        Auditoria auditoria = new Auditoria();
        auditoria.setFecha(LocalDateTime.now());
        auditoria.setUsuario(usuario);
        auditoria.setAccion(truncar(texto, MAX_ACCION_LENGTH));
        auditoria.setTipoAccion(truncar(texto, 20));
        auditoria.setEntidad(null);
        auditoria.setDetalle(truncar(texto, MAX_DETALLE_LENGTH));
        auditoriaRepository.save(auditoria);
    }

    /**
     * Registra una acción de auditoría usando el usuario actual del SecurityContext.
     * Tipo: INSERT, UPDATE, DELETE. Entidad: ej. "Usuario", "Marca". Detalle: descripción legible.
     */
    public void registrar(String tipoAccion, String entidad, String detalle) {
        Optional<Usuario> usuarioOpt = obtenerUsuarioActual();
        if (usuarioOpt.isEmpty()) return;

        String detalleSeguro = truncar(detalle != null ? detalle : "", MAX_DETALLE_LENGTH);
        String accion = truncar(tipoAccion + " en " + entidad + ": " + detalleSeguro, MAX_ACCION_LENGTH);
        Auditoria auditoria = new Auditoria();
        auditoria.setFecha(LocalDateTime.now());
        auditoria.setUsuario(usuarioOpt.get());
        auditoria.setAccion(accion);
        auditoria.setTipoAccion(truncar(tipoAccion, 20));
        auditoria.setEntidad(truncar(entidad, 100));
        auditoria.setDetalle(detalleSeguro);
        auditoriaRepository.save(auditoria);
    }

    private static String truncar(String s, int maxLen) {
        if (s == null || s.isEmpty() || maxLen <= 0) {
            return s == null ? "" : s;
        }
        if (s.length() <= maxLen) {
            return s;
        }
        if (maxLen <= 1) {
            return s.substring(0, maxLen);
        }
        return s.substring(0, maxLen - 1) + "…";
    }

    private Optional<Usuario> obtenerUsuarioActual() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) return Optional.empty();
        String username = auth.getPrincipal().toString();
        return usuarioRepository.findByUsuario(username);
    }

    /** Devuelve el usuario actual de la sesión (JWT). Útil para asignar usuario_activa_id, usuario_id, etc. */
    public Optional<Usuario> getUsuarioActual() {
        return obtenerUsuarioActual();
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

    public List<AuditoriaDTO> listarTodas(String tipoAccion) {
        if (tipoAccion != null && !tipoAccion.isBlank()) {
            return auditoriaRepository.findAllByTipoAccionOrderByFechaDesc(tipoAccion.trim()).stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        }
        return auditoriaRepository.findAllByOrderByFechaDesc().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<AuditoriaDTO> listarPorUsuario(Long usuarioId, String tipoAccion) {
        if (tipoAccion != null && !tipoAccion.isBlank()) {
            return auditoriaRepository.findByUsuario_UsuarioIdAndTipoAccionOrderByFechaDesc(usuarioId, tipoAccion.trim()).stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        }
        return auditoriaRepository.findByUsuario_UsuarioIdOrderByFechaDesc(usuarioId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<AuditoriaDTO> listarPorRol(Long rolId, String tipoAccion) {
        List<Long> usuarioIds = usuarioRolesRepository.findByRol_RolId(rolId).stream()
                .map(ur -> ur.getUsuario().getUsuarioId())
                .collect(Collectors.toList());
        if (usuarioIds.isEmpty()) return List.of();
        if (tipoAccion != null && !tipoAccion.isBlank()) {
            return auditoriaRepository.findByUsuario_UsuarioIdInAndTipoAccionOrderByFechaDesc(usuarioIds, tipoAccion.trim()).stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        }
        return auditoriaRepository.findByUsuario_UsuarioIdInOrderByFechaDesc(usuarioIds).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}