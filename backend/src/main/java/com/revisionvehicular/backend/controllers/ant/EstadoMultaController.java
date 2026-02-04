package com.revisionvehicular.backend.controllers.ant;

import com.revisionvehicular.backend.dtos.ant.EstadoMultaDTO;
import com.revisionvehicular.backend.service.ant.IEstadoMultaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/estadomulta")

public class EstadoMultaController {

    private final IEstadoMultaService service;

    public EstadoMultaController(IEstadoMultaService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<EstadoMultaDTO> crear(
            @RequestBody EstadoMultaDTO dto
    ) {
        EstadoMultaDTO creado = service.save(dto);
        return new ResponseEntity<>(creado, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<EstadoMultaDTO>> listar() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EstadoMultaDTO> obtenerPorId(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EstadoMultaDTO> actualizar(
            @PathVariable Long id,
            @RequestBody EstadoMultaDTO dto
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
