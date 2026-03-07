package com.revisionvehicular.backend.controllers.rtv;

import com.revisionvehicular.backend.dtos.rtv.CrearInspeccionRequest;
import com.revisionvehicular.backend.dtos.rtv.InspeccionDTO;
import com.revisionvehicular.backend.service.rtv.IInspeccionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inspecciones")
public class InspeccionController {

    private final IInspeccionService service;

    public InspeccionController(IInspeccionService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<InspeccionDTO> crear(@RequestBody CrearInspeccionRequest request) {
        InspeccionDTO creado = service.crear(request);
        return new ResponseEntity<>(creado, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<InspeccionDTO>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InspeccionDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.obtenerPorId(id));
    }
}
