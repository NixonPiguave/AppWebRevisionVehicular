package com.revisionvehicular.backend.controllers.rtv;

import com.revisionvehicular.backend.dtos.rtv.BajaVehiculoDTO;
import com.revisionvehicular.backend.service.rtv.IBajaVehiculoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bajas-vehiculo")
public class BajaVehiculoController {

    private final IBajaVehiculoService service;

    public BajaVehiculoController(IBajaVehiculoService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<BajaVehiculoDTO> crear(@RequestBody BajaVehiculoDTO dto) {
        BajaVehiculoDTO creado = service.save(dto);
        return new ResponseEntity<>(creado, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<BajaVehiculoDTO>> listar() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BajaVehiculoDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BajaVehiculoDTO> actualizar(
            @PathVariable Long id,
            @RequestBody BajaVehiculoDTO dto
    ) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

