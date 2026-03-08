package com.revisionvehicular.backend.controllers.rtv;

import com.revisionvehicular.backend.dtos.rtv.AnulacionTramiteServicioDTO;
import com.revisionvehicular.backend.service.rtv.IAnulacionTramiteServicioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/anulacion-tramites")
public class AnulacionTramiteServicioController {

    private final IAnulacionTramiteServicioService service;

    public AnulacionTramiteServicioController(IAnulacionTramiteServicioService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<AnulacionTramiteServicioDTO> crear(@RequestBody AnulacionTramiteServicioDTO dto) {
        return new ResponseEntity<>(service.save(dto), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<AnulacionTramiteServicioDTO>> listar() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnulacionTramiteServicioDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AnulacionTramiteServicioDTO> actualizar(@PathVariable Long id, @RequestBody AnulacionTramiteServicioDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
