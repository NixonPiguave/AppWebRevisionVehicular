package com.revisionvehicular.backend.controllers.srtv;

import com.revisionvehicular.backend.dtos.srtv.EmpresaDTO;
import com.revisionvehicular.backend.service.srtv.IEmpresaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/empresa")
public class EmpresaController {

    private final IEmpresaService service;

    public EmpresaController(IEmpresaService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<EmpresaDTO> crear(@Valid @RequestBody EmpresaDTO dto) {
        EmpresaDTO crear = service.save(dto);
        return new ResponseEntity<>(crear, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<EmpresaDTO>> listar() {
        return ResponseEntity.ok(service.findAll());
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmpresaDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody EmpresaDTO dto
    ) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")           // ← corregido: faltaba /{id}
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}