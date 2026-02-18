package com.revisionvehicular.backend.controllers.rc;

import com.revisionvehicular.backend.dtos.rc.UmbralDTO;
import com.revisionvehicular.backend.service.rc.IUmbralService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("api/umbral")
public class UmbralController {

    private final IUmbralService service;

    public UmbralController(IUmbralService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<UmbralDTO> crear(@RequestBody UmbralDTO dto) {
        return new ResponseEntity<>(service.save(dto), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<UmbralDTO>> listar() {
        return ResponseEntity.ok(service.findAll());
    }

    @PutMapping("/{id}")
    public ResponseEntity<UmbralDTO> actualizar(
            @PathVariable Long id,
            @RequestBody UmbralDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
