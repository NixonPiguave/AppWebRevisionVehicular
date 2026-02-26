package com.revisionvehicular.backend.controllers.cv;

import com.revisionvehicular.backend.dtos.cv.SubcategoriaDTO;
import com.revisionvehicular.backend.service.cv.ISubcategoriaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/subcategorias")
public class SubcategoriaController {

    private final ISubcategoriaService service;

    public SubcategoriaController(ISubcategoriaService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<SubcategoriaDTO> crear(@RequestBody SubcategoriaDTO dto) {
        SubcategoriaDTO creada = service.save(dto);
        return new ResponseEntity<>(creada, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<SubcategoriaDTO>> listar() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubcategoriaDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubcategoriaDTO> actualizar(
            @PathVariable Long id,
            @RequestBody SubcategoriaDTO dto) {

        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
