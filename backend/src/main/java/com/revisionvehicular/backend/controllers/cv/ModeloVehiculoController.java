package com.revisionvehicular.backend.controllers.cv;

import com.revisionvehicular.backend.dtos.cv.ModeloVehiculoDTO;
import com.revisionvehicular.backend.service.cv.IModeloVehiculoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/modelosvehiculo")

public class ModeloVehiculoController {

    private final IModeloVehiculoService service;

    public ModeloVehiculoController(IModeloVehiculoService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ModeloVehiculoDTO> crear(@RequestBody ModeloVehiculoDTO dto) {
        ModeloVehiculoDTO creado = service.save(dto);
        return new ResponseEntity<>(creado, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ModeloVehiculoDTO>> listar() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ModeloVehiculoDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @GetMapping("/marca/{idMarca}")
    public ResponseEntity<List<ModeloVehiculoDTO>> listarPorMarca(@PathVariable Long idMarca) {
        return ResponseEntity.ok(service.findByMarca(idMarca));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ModeloVehiculoDTO> actualizar(
            @PathVariable Long id,
            @RequestBody ModeloVehiculoDTO dto) {

        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
