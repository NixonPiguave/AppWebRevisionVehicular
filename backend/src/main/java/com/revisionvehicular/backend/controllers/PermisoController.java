package com.revisionvehicular.backend.controllers;

import com.revisionvehicular.backend.dtos.srtv.PermisoDTO;
import com.revisionvehicular.backend.service.IPermisoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/permisos")
public class PermisoController {

    private final IPermisoService permisoService;

    public PermisoController(IPermisoService permisoService) {
        this.permisoService = permisoService;
    }
    @PostMapping
    public ResponseEntity<PermisoDTO> addPermiso(@RequestBody PermisoDTO permisoDTO) {
        PermisoDTO crear = permisoService.save(permisoDTO);
        return new ResponseEntity<>(crear, HttpStatus.CREATED);
    }
    @GetMapping
    public ResponseEntity<List<PermisoDTO>> listarPermisos() {
        return ResponseEntity.ok(permisoService.findAll());
    }
    @GetMapping("/{id}")
    public ResponseEntity<PermisoDTO> obtenerPermiso(@PathVariable Long id) {
        return ResponseEntity.ok(permisoService.findById(id));
    }
    @PutMapping("/{id}")
    public ResponseEntity<PermisoDTO> actualizarPermiso(@PathVariable Long id, @RequestBody PermisoDTO permisoDTO) {
        return ResponseEntity.ok(permisoService.update(id, permisoDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarPermiso(@PathVariable Long id) {
        permisoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}