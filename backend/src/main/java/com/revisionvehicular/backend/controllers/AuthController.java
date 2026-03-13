package com.revisionvehicular.backend.controllers;

import com.revisionvehicular.backend.entities.srtv.Usuario;
import com.revisionvehicular.backend.entities.srtv.UsuarioRoles;
import com.revisionvehicular.backend.repositories.srtv.IUsuarioRepository;
import com.revisionvehicular.backend.repositories.srtv.IUsuarioRolesRepository;
import com.revisionvehicular.backend.security.JwtUtil;
import com.revisionvehicular.backend.service.srtv.IOpcionMenuService;
import com.revisionvehicular.backend.service.srtv.ISesionUsuarioService;
import com.revisionvehicular.backend.dtos.srtv.SesionUsuarioDTO;
import com.revisionvehicular.backend.security.UserDatabaseContext;
import com.revisionvehicular.backend.service.srtv.AuditoriaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final IUsuarioRepository usuarioRepository;
    private final IUsuarioRolesRepository usuarioRolesRepository;
    private final IOpcionMenuService opcionMenuService;
    private final ISesionUsuarioService sesionUsuarioService;
    private final JwtUtil jwtUtil;
    private final AuditoriaService auditoriaService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthController(
            IUsuarioRepository usuarioRepository,
            IUsuarioRolesRepository usuarioRolesRepository,
            IOpcionMenuService opcionMenuService,
            ISesionUsuarioService sesionUsuarioService,
            JwtUtil jwtUtil,
            AuditoriaService auditoriaService
    ) {
        this.usuarioRepository = usuarioRepository;
        this.usuarioRolesRepository = usuarioRolesRepository;
        this.opcionMenuService = opcionMenuService;
        this.sesionUsuarioService = sesionUsuarioService;
        this.jwtUtil = jwtUtil;
        this.auditoriaService = auditoriaService;
    }

    @GetMapping("/check-session")
    public ResponseEntity<Void> checkSession() {
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String usuario = credentials.get("usuario");
        String contrasena = credentials.get("contrasena");

        Optional<Usuario> optionalUser = usuarioRepository.findByUsuario(usuario);

        if (optionalUser.isEmpty() || !passwordEncoder.matches(contrasena, optionalUser.get().getContrasena())) {
            return ResponseEntity.status(401).body("Credenciales inválidas");
        }
        if(optionalUser.get().getEstado().equals("Inactivo")){
            return ResponseEntity.status(401).body("Usuario no se encuentra activo");
        }


        Usuario user = optionalUser.get();


        UserDatabaseContext.setCredentials(user.getUsuarioBaseDatos(), user.getContrasenaBaseDatos());

        auditoriaService.registrarAccion(user, "INICIO_SESION");

        SesionUsuarioDTO sesion = sesionUsuarioService.crearSesion(user);
        String token = jwtUtil.generateToken(
                user.getUsuario(),
                user.getUsuarioBaseDatos(),
                user.getContrasenaBaseDatos(),
                sesion.getSesionId()
        );

        List<String> permisos = opcionMenuService.getOpcionMenuClavesByUsuario(user);

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("usuario", user.getUsuario());
        response.put("nombre", user.getNombre() + " " + user.getApellido());
        response.put("usuarioId", user.getUsuarioId());
        response.put("rol", obtenerNombreRol(user));
        response.put("permisos", permisos != null ? permisos : List.of());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            sesionUsuarioService.cerrarSesionPorToken(token);
            Long usuarioId = null;
            try {
                String username = jwtUtil.extractUsername(token);
                Optional<Usuario> optionalUser = usuarioRepository.findByUsuario(username);
                if (optionalUser.isPresent()) {
                    Usuario user = optionalUser.get();
                    UserDatabaseContext.setCredentials(user.getUsuarioBaseDatos(), user.getContrasenaBaseDatos());
                    auditoriaService.registrarAccion(user, "CIERRE_SESION");
                }
            } catch (Exception ignored) {}
        }
        return ResponseEntity.ok("Sesión cerrada");
    }

    private String obtenerNombreRol(Usuario user) {
        List<UsuarioRoles> roles = usuarioRolesRepository.findByUsuario(user);
        if (roles == null || roles.isEmpty()) {
            return null;
        }
        UsuarioRoles primero = roles.get(0);
        return (primero.getRol() != null) ? primero.getRol().getNombre() : null;
    }
}