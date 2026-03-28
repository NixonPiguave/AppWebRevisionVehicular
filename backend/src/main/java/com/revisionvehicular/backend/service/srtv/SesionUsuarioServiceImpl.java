package com.revisionvehicular.backend.service.srtv;

import com.revisionvehicular.backend.dtos.srtv.SesionUsuarioDTO;
import com.revisionvehicular.backend.entities.srtv.SesionUsuario;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import com.revisionvehicular.backend.entities.srtv.UsuarioRoles;
import com.revisionvehicular.backend.repositories.srtv.ISesionUsuarioRepository;
import com.revisionvehicular.backend.repositories.srtv.IUsuarioRolesRepository;
import com.revisionvehicular.backend.security.JwtUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SesionUsuarioServiceImpl implements ISesionUsuarioService {

    private final ISesionUsuarioRepository sesionRepository;
    private final IUsuarioRolesRepository usuarioRolesRepository;
    private final JwtUtil jwtUtil;

    public SesionUsuarioServiceImpl(ISesionUsuarioRepository sesionRepository,
                                    IUsuarioRolesRepository usuarioRolesRepository,
                                    JwtUtil jwtUtil) {
        this.sesionRepository = sesionRepository;
        this.usuarioRolesRepository = usuarioRolesRepository;
        this.jwtUtil = jwtUtil;
    }

    @Override
    @Transactional
    public SesionUsuarioDTO crearSesion(Usuario usuario) {
        List<SesionUsuario> activas = sesionRepository.findByUsuario_UsuarioIdAndActivoTrue(usuario.getUsuarioId());
        boolean sesionesAnterioresCerradas = !activas.isEmpty();
        cerrarSesionesDeUsuario(usuario.getUsuarioId());
        SesionUsuario s = new SesionUsuario();
        s.setUsuario(usuario);
        s.setFechaLogin(Instant.now());
        s.setUltimaActividad(Instant.now());
        s.setActivo(true);
        s = sesionRepository.save(s);
        SesionUsuarioDTO dto = toDTO(s);
        dto.setSesionesAnterioresCerradas(sesionesAnterioresCerradas);
        return dto;
    }

    @Override
    @Transactional
    public void cerrarSesionesDeUsuario(Long usuarioId) {
        List<SesionUsuario> activas = sesionRepository.findByUsuario_UsuarioIdAndActivoTrue(usuarioId);
        for (SesionUsuario s : activas) {
            s.setActivo(false);
            s.setUltimaActividad(Instant.now());
            sesionRepository.save(s);
        }
    }

    @Override
    @Transactional
    public void cerrarSesion(Long sesionId) {
        sesionRepository.cerrarSesionDirecto(sesionId);
    }

    @Override
    @Transactional
    public void cerrarSesionPorToken(String token) {
        try {
            Long sid = jwtUtil.extractSesionId(token);
            if (sid != null) {
                cerrarSesion(sid);
            }
        } catch (Exception ignored) {}
    }

    @Override
    @Transactional(readOnly = true)
    public List<SesionUsuarioDTO> listarActivas() {
        return sesionRepository.findByActivoTrueWithUsuario().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isSesionActiva(Long sesionId) {
        if (sesionId == null) return false;
        return sesionRepository.findBySesionIdAndActivoTrue(sesionId).isPresent();
    }

    private String obtenerNombreRol(Usuario u) {
        List<UsuarioRoles> list = usuarioRolesRepository.findByUsuario(u);
        if (list == null || list.isEmpty()) return null;
        UsuarioRoles ur = list.get(0);
        return ur.getRol() != null ? ur.getRol().getNombre() : null;
    }

    private SesionUsuarioDTO toDTO(SesionUsuario s) {
        SesionUsuarioDTO dto = new SesionUsuarioDTO();
        dto.setSesionId(s.getSesionId());
        dto.setUsuarioId(s.getUsuario().getUsuarioId());
        dto.setUsuario(s.getUsuario().getUsuario());
        dto.setNombreCompleto(s.getUsuario().getNombre() + " " + s.getUsuario().getApellido());
        dto.setRol(obtenerNombreRol(s.getUsuario()));
        dto.setFechaLogin(s.getFechaLogin());
        dto.setUltimaActividad(s.getUltimaActividad());
        return dto;
    }
}
