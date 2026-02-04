package com.revisionvehicular.backend.controllers.rc;

import com.revisionvehicular.backend.dtos.rc.UnidadesMedidaDTO;
import com.revisionvehicular.backend.dtos.rc.UnidadesMedidaDTO;
import com.revisionvehicular.backend.service.rc.IUnidadMedidaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/unidadesmedida")
public class UnidadMedidaController {

    private final IUnidadMedidaService service;

    public UnidadMedidaController(IUnidadMedidaService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<UnidadesMedidaDTO> crear(
            @RequestBody UnidadesMedidaDTO dto
    ) {
        return new ResponseEntity<>(service.save(dto), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<UnidadesMedidaDTO>> listar() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UnidadesMedidaDTO> obtenerPorId(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UnidadesMedidaDTO> actualizar(
            @PathVariable Long id,
            @RequestBody UnidadesMedidaDTO dto
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
