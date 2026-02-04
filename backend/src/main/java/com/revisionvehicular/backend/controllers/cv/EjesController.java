package com.revisionvehicular.backend.controllers.cv;

import com.revisionvehicular.backend.dtos.cv.EjesDTO;
import com.revisionvehicular.backend.service.cv.IEjesService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/ejes")
public class EjesController {

    private final IEjesService service;

    public EjesController(IEjesService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<EjesDTO> crear(
            @RequestBody EjesDTO dto
    ) {
        EjesDTO creado = service.save(dto);
        return new ResponseEntity<>(creado, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<EjesDTO>> listar() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EjesDTO> obtenerPorId(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EjesDTO> actualizar(
            @PathVariable Long id,
            @RequestBody EjesDTO dto
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
