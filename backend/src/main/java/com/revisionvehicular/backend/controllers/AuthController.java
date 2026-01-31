package com.revisionvehicular.backend.controllers;

import com.revisionvehicular.backend.entities.srtv.Usuario;
import com.revisionvehicular.backend.repositories.srtv.IUsuarioRepository;
import com.revisionvehicular.backend.security.JwtUtil;
import com.revisionvehicular.backend.security.UserDatabaseContext;
import com.revisionvehicular.backend.service.AuditoriaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final IUsuarioRepository usuarioRepository;
    private final JwtUtil jwtUtil;
    private final AuditoriaService auditoriaService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthController(IUsuarioRepository usuarioRepository, JwtUtil jwtUtil, AuditoriaService auditoriaService) {
        this.usuarioRepository = usuarioRepository;
        this.jwtUtil = jwtUtil;
        this.auditoriaService = auditoriaService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String usuario = credentials.get("usuario");
        String contrasena = credentials.get("contrasena");

        Optional<Usuario> optionalUser = usuarioRepository.findByUsuario(usuario);

        if (optionalUser.isEmpty() || !passwordEncoder.matches(contrasena, optionalUser.get().getContrasena())) {
            return ResponseEntity.status(401).body("Credenciales inválidas");
        }

        Usuario user = optionalUser.get();

        // Establecer credenciales del usuario para la auditoría
        UserDatabaseContext.setCredentials(user.getUsuarioBaseDatos(), user.getContrasenaBaseDatos());

        // Registrar auditoría con el usuario correcto
        auditoriaService.registrarAccion(user, "INICIO_SESION");

        String token = jwtUtil.generateToken(
                user.getUsuario(),
                user.getUsuarioBaseDatos(),
                user.getContrasenaBaseDatos()
        );

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("usuario", user.getUsuario());
        response.put("nombre", user.getNombre() + " " + user.getApellido());
        response.put("usuarioId", user.getUsuarioId());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody Map<String, Long> request) {
        Long usuarioId = request.get("usuarioId");

        if (usuarioId != null) {
            Optional<Usuario> optionalUser = usuarioRepository.findById(usuarioId);
            if (optionalUser.isPresent()) {
                Usuario user = optionalUser.get();
                UserDatabaseContext.setCredentials(user.getUsuarioBaseDatos(), user.getContrasenaBaseDatos());
                auditoriaService.registrarAccion(user, "CIERRE_SESION");
            }
        }

        return ResponseEntity.ok("Sesión cerrada");
    }
}