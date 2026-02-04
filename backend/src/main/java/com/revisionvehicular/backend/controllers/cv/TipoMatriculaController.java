package com.revisionvehicular.backend.controllers.cv;

import com.revisionvehicular.backend.dtos.cv.TipoMatriculaDTO;
import com.revisionvehicular.backend.service.cv.ITipoMatriculaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/tipomatricula")
public class TipoMatriculaController {

    private final ITipoMatriculaService service;

    public TipoMatriculaController(ITipoMatriculaService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<TipoMatriculaDTO> crear(
            @RequestBody TipoMatriculaDTO dto
    ) {
        TipoMatriculaDTO creado = service.save(dto);
        return new ResponseEntity<>(creado, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<TipoMatriculaDTO>> listar() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TipoMatriculaDTO> obtenerPorId(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TipoMatriculaDTO> actualizar(
            @PathVariable Long id,
            @RequestBody TipoMatriculaDTO dto
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
