package com.revisionvehicular.backend.controllers.ant;

import com.revisionvehicular.backend.dtos.ant.TipoBloqueoDTO;
import com.revisionvehicular.backend.service.ant.ITipoBloqueoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tipos-bloqueo")
public class TipoBloqueoController {

    private final ITipoBloqueoService service;

    public TipoBloqueoController(ITipoBloqueoService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<TipoBloqueoDTO>> listar() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/instituciones")
    public ResponseEntity<List<String>> listarInstituciones() {
        return ResponseEntity.ok(service.findDistinctInstituciones());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TipoBloqueoDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }
}
