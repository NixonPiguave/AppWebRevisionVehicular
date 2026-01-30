package com.revisionvehicular.backend.controllers;

import com.revisionvehicular.backend.dtos.LoginRequest;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import com.revisionvehicular.backend.repositories.srtv.IUsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    private final IUsuarioRepository IUsuarioRepository;

    public AuthController(IUsuarioRepository IUsuarioRepository) {
        this.IUsuarioRepository = IUsuarioRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        Optional<Usuario> usuarioOpt =
                IUsuarioRepository.findByUsuario(request.getUsuario());

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