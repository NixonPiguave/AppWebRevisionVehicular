package com.revisionvehicular.backend.controllers.cv;

import com.revisionvehicular.backend.dtos.cv.CapCargaDTO;
import com.revisionvehicular.backend.service.cv.ICapCargaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("api/capcarga")
public class CapCargaController {

    private final ICapCargaService service;

    public CapCargaController(ICapCargaService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<CapCargaDTO> crear(
            @RequestBody CapCargaDTO dto
    ) {
        CapCargaDTO creado = service.save(dto);
        return new ResponseEntity<>(creado, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<CapCargaDTO>> listar() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CapCargaDTO> obtenerPorId(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CapCargaDTO> actualizar(
            @PathVariable Long id,
            @RequestBody CapCargaDTO dto
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
