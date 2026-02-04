package com.revisionvehicular.backend.controllers.pv;

import com.revisionvehicular.backend.dtos.pv.PropietarioDTO;
import com.revisionvehicular.backend.service.pv.IPropietarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/propietarios")

public class PropietarioController {

    private final IPropietarioService service;

    public PropietarioController(IPropietarioService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<PropietarioDTO> crear(
            @RequestBody PropietarioDTO dto
    ) {
        PropietarioDTO creado = service.save(dto);
        return new ResponseEntity<>(creado, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<PropietarioDTO>> listar() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PropietarioDTO> obtenerPorId(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PropietarioDTO> actualizar(
            @PathVariable Long id,
            @RequestBody PropietarioDTO dto
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
