package com.revisionvehicular.backend.controllers.rtv;

import com.revisionvehicular.backend.dtos.rtv.RegistroObservacionDTO;
import com.revisionvehicular.backend.service.rtv.IRegistroObservacionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/registro-observaciones")
public class RegistroObservacionController {

    private final IRegistroObservacionService service;

    public RegistroObservacionController(IRegistroObservacionService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<RegistroObservacionDTO> crear(@RequestBody RegistroObservacionDTO dto) {
        RegistroObservacionDTO creado = service.save(dto);
        return new ResponseEntity<>(creado, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<RegistroObservacionDTO>> listar() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RegistroObservacionDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RegistroObservacionDTO> actualizar(
            @PathVariable Long id,
            @RequestBody RegistroObservacionDTO dto
    ) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
