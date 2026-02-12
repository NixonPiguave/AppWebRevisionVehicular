package com.revisionvehicular.backend.controllers.cv;

import com.revisionvehicular.backend.dtos.cv.TipoVehiculoDTO;
import com.revisionvehicular.backend.service.cv.ITipoVehiculoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/tipoVehiculo")
public class TipoVehiculoController {

    private final ITipoVehiculoService service;

    public TipoVehiculoController(ITipoVehiculoService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<TipoVehiculoDTO> crear(@RequestBody TipoVehiculoDTO dto) {
        TipoVehiculoDTO creado = service.save(dto);
        return new ResponseEntity<>(creado, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<TipoVehiculoDTO>> listar() {
        return ResponseEntity.ok(service.findAll());
    }
    @GetMapping("/{id}")
    public ResponseEntity<TipoVehiculoDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TipoVehiculoDTO> actualizar(
            @PathVariable Long id,
            @RequestBody TipoVehiculoDTO dto) {

        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
