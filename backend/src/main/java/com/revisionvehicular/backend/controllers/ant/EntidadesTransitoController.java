package com.revisionvehicular.backend.controllers.ant;

import com.revisionvehicular.backend.dtos.ant.EntidadesTransitoDTO;
import com.revisionvehicular.backend.service.ant.IEntidadesTransitoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/entidades-transito")

public class EntidadesTransitoController {

    private final IEntidadesTransitoService service;

    public EntidadesTransitoController(IEntidadesTransitoService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<EntidadesTransitoDTO> crear(
            @RequestBody EntidadesTransitoDTO dto
    ) {
        EntidadesTransitoDTO creado = service.save(dto);
        return new ResponseEntity<>(creado, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<EntidadesTransitoDTO>> listar() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EntidadesTransitoDTO> obtenerPorId(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EntidadesTransitoDTO> actualizar(
            @PathVariable Long id,
            @RequestBody EntidadesTransitoDTO dto
    ) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id
    ) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
