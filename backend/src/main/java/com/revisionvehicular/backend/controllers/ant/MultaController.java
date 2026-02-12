package com.revisionvehicular.backend.controllers.ant;

import com.revisionvehicular.backend.dtos.ant.MultaDTO;
import com.revisionvehicular.backend.service.ant.IMultaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/multa")
public class MultaController {

    private final IMultaService service;

    public MultaController(IMultaService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Void> crear(@RequestBody MultaDTO dto) {
        service.crear(dto);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> actualizar(@PathVariable Long id, @RequestBody MultaDTO dto) {
        service.actualizar(id, dto);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<MultaDTO>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MultaDTO> buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
