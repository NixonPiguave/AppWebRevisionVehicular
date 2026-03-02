package com.revisionvehicular.backend.controllers.rtv;

import com.revisionvehicular.backend.dtos.rtv.DesbloqueoVehiculoDTO;
import com.revisionvehicular.backend.service.rtv.IDesbloqueoVehiculoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/desbloqueos-vehiculo")
public class DesbloqueoVehiculoController {

    private final IDesbloqueoVehiculoService service;

    public DesbloqueoVehiculoController(IDesbloqueoVehiculoService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<DesbloqueoVehiculoDTO> crear(@RequestBody DesbloqueoVehiculoDTO dto) {
        DesbloqueoVehiculoDTO creado = service.save(dto);
        return new ResponseEntity<>(creado, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<DesbloqueoVehiculoDTO>> listar() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DesbloqueoVehiculoDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DesbloqueoVehiculoDTO> actualizar(
            @PathVariable Long id,
            @RequestBody DesbloqueoVehiculoDTO dto
    ) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

