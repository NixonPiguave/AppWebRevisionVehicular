package com.revisionvehicular.backend.controllers.ant;

import com.revisionvehicular.backend.dtos.ant.ExcepcionesDTO;
import com.revisionvehicular.backend.service.ant.IExcepcionesService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/excepciones")
public class ExcepcionesController {

    private final IExcepcionesService service;

    public ExcepcionesController(IExcepcionesService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ExcepcionesDTO> crear(
            @RequestBody ExcepcionesDTO dto
    ) {
        ExcepcionesDTO creado = service.save(dto);
        return new ResponseEntity<>(creado, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ExcepcionesDTO>> listar() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExcepcionesDTO> obtenerPorId(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExcepcionesDTO> actualizar(
            @PathVariable Long id,
            @RequestBody ExcepcionesDTO dto
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