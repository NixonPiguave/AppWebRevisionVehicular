package com.revisionvehicular.backend.controllers.rtv;

import com.revisionvehicular.backend.dtos.rtv.MetodoInspeccionDTO;
import com.revisionvehicular.backend.service.rtv.IMetodoInspeccionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/metodosinpeccion")

public class MetodoInspeccionController {

    private final IMetodoInspeccionService service;

    public MetodoInspeccionController(IMetodoInspeccionService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<MetodoInspeccionDTO> crear(
            @RequestBody MetodoInspeccionDTO dto
    ) {
        MetodoInspeccionDTO creado = service.save(dto);
        return new ResponseEntity<>(creado, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<MetodoInspeccionDTO>> listar() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MetodoInspeccionDTO> obtenerPorId(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MetodoInspeccionDTO> actualizar(
            @PathVariable Long id,
            @RequestBody MetodoInspeccionDTO dto
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
