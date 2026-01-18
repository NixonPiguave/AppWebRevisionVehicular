package com.revisionvehicular.backend.controllers;

import com.revisionvehicular.backend.dtos.LoginRequest;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import com.revisionvehicular.backend.repositories.srtv.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    private final UsuarioRepository usuarioRepository;

    public AuthController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        Optional<Usuario> usuarioOpt =
                usuarioRepository.findByUsuario(request.getUsuario());

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(401).body("Usuario no existe");
        }

        Usuario usuario = usuarioOpt.get();

        if (!usuario.getContrasena().equals(request.getPassword())) {
            return ResponseEntity.status(401).body("Contraseña incorrecta");
        }

        return ResponseEntity.ok("Login correcto");
    }
}