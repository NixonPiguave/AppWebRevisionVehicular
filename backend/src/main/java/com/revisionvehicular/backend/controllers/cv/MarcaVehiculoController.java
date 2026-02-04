package com.revisionvehicular.backend.controllers.cv;

import com.revisionvehicular.backend.dtos.cv.MarcaVehiculoDTO;
import com.revisionvehicular.backend.service.cv.IMarcaVehiculoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("api/marcas")

public class MarcaVehiculoController {

    private final IMarcaVehiculoService service;

    public MarcaVehiculoController(IMarcaVehiculoService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<MarcaVehiculoDTO> crear(
            @RequestBody MarcaVehiculoDTO dto
    ) {
        MarcaVehiculoDTO creado = service.save(dto);
        return new ResponseEntity<>(creado, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<MarcaVehiculoDTO>> listar() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MarcaVehiculoDTO> obtenerPorId(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MarcaVehiculoDTO> actualizar(
            @PathVariable Long id,
            @RequestBody MarcaVehiculoDTO dto
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
