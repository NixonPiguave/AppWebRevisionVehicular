package com.revisionvehicular.backend.controllers.cv;

import com.revisionvehicular.backend.dtos.cv.TraccionDTO;
import com.revisionvehicular.backend.service.cv.ITraccionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/tracciones")

public class TraccionController {

    private final ITraccionService service;

    public TraccionController(ITraccionService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<TraccionDTO> crear(
            @RequestBody TraccionDTO dto
    ) {
        TraccionDTO creado = service.save(dto);
        return new ResponseEntity<>(creado, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<TraccionDTO>> listar() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TraccionDTO> obtenerPorId(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TraccionDTO> actualizar(
            @PathVariable Long id,
            @RequestBody TraccionDTO dto
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
