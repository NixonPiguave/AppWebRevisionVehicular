package com.revisionvehicular.backend.controllers.rtv;

import com.revisionvehicular.backend.dtos.rtv.BloqueoVehiculoDTO;
import com.revisionvehicular.backend.service.rtv.IBloqueoVehiculoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bloqueos-vehiculo")
public class BloqueoVehiculoController {

    private final IBloqueoVehiculoService service;

    public BloqueoVehiculoController(IBloqueoVehiculoService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<BloqueoVehiculoDTO> crear(@RequestBody BloqueoVehiculoDTO dto) {
        BloqueoVehiculoDTO creado = service.save(dto);
        return new ResponseEntity<>(creado, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<BloqueoVehiculoDTO>> listar() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BloqueoVehiculoDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BloqueoVehiculoDTO> actualizar(
            @PathVariable Long id,
            @RequestBody BloqueoVehiculoDTO dto
    ) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

