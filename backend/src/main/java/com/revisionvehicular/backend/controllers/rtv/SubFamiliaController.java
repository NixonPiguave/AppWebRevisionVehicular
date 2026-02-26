package com.revisionvehicular.backend.controllers.rtv;

import com.revisionvehicular.backend.dtos.rtv.SubfamiliaDTO;
import com.revisionvehicular.backend.service.rtv.ISubFamiliaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subfamilias")
public class SubFamiliaController {

    private final ISubFamiliaService service;

    public SubFamiliaController(ISubFamiliaService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<SubfamiliaDTO> crear(
            @RequestBody SubfamiliaDTO dto
    ) {
        SubfamiliaDTO creado = service.save(dto);
        return new ResponseEntity<>(creado, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<SubfamiliaDTO>> listar() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubfamiliaDTO> obtenerPorId(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubfamiliaDTO> actualizar(
            @PathVariable Long id,
            @RequestBody SubfamiliaDTO dto
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