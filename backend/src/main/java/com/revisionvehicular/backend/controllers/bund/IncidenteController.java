package com.revisionvehicular.backend.controllers.bund;

import com.revisionvehicular.backend.dtos.bund.IncidenteDTO;
import com.revisionvehicular.backend.service.bund.IIncidenteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidentes")
public class IncidenteController {

    private final IIncidenteService service;

    public IncidenteController(IIncidenteService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<IncidenteDTO> crear(@RequestBody IncidenteDTO dto) {
        return new ResponseEntity<>(service.save(dto), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<IncidenteDTO>> listar() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncidenteDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<IncidenteDTO> actualizar(@PathVariable Long id, @RequestBody IncidenteDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
