package com.revisionvehicular.backend.controllers.cv;

import com.revisionvehicular.backend.dtos.cv.TipoCombustibleDTO;
import com.revisionvehicular.backend.service.cv.ITipoCombustibleService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("api/combustible")

public class TipoCombustibleController {

    private final ITipoCombustibleService service;

    public TipoCombustibleController(ITipoCombustibleService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<TipoCombustibleDTO> crear(
            @RequestBody TipoCombustibleDTO dto
    ) {
        TipoCombustibleDTO creado = service.save(dto);
        return new ResponseEntity<>(creado, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<TipoCombustibleDTO>> listar() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TipoCombustibleDTO> obtenerPorId(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TipoCombustibleDTO> actualizar(
            @PathVariable Long id,
            @RequestBody TipoCombustibleDTO dto
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
