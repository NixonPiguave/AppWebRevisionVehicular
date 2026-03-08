package com.revisionvehicular.backend.controllers.srtv;

import com.revisionvehicular.backend.dtos.srtv.AuditoriaDTO;
import com.revisionvehicular.backend.service.srtv.AuditoriaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auditoria")
public class AuditoriaController {

    private final AuditoriaService auditoriaService;

    public AuditoriaController(AuditoriaService auditoriaService) {
        this.auditoriaService = auditoriaService;
    }

    @GetMapping
    public ResponseEntity<List<AuditoriaDTO>> listarTodas() {
        return ResponseEntity.ok(auditoriaService.listarTodas());
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<AuditoriaDTO>> listarPorUsuario(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(auditoriaService.listarPorUsuario(usuarioId));
    }

    @GetMapping("/rol/{rolId}")
    public ResponseEntity<List<AuditoriaDTO>> listarPorRol(@PathVariable Long rolId) {
        return ResponseEntity.ok(auditoriaService.listarPorRol(rolId));
    }
}
