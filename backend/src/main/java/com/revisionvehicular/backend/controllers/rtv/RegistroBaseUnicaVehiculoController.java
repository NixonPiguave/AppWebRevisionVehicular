package com.revisionvehicular.backend.controllers.rtv;

import com.revisionvehicular.backend.dtos.rtv.RegistroBaseUnicaVehiculoDTO;
import com.revisionvehicular.backend.service.rtv.IRegistroBaseUnicaVehiculoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/registro-base-unica-vehiculos")
public class RegistroBaseUnicaVehiculoController {

    private final IRegistroBaseUnicaVehiculoService service;

    public RegistroBaseUnicaVehiculoController(IRegistroBaseUnicaVehiculoService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<RegistroBaseUnicaVehiculoDTO> crear(@RequestBody RegistroBaseUnicaVehiculoDTO dto) {
        return new ResponseEntity<>(service.save(dto), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<RegistroBaseUnicaVehiculoDTO>> listar() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RegistroBaseUnicaVehiculoDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RegistroBaseUnicaVehiculoDTO> actualizar(@PathVariable Long id, @RequestBody RegistroBaseUnicaVehiculoDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
