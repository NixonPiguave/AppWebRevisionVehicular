package com.revisionvehicular.backend.controllers;

import com.revisionvehicular.backend.dtos.srtv.UsuarioDTO;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import com.revisionvehicular.backend.service.IUsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {
    private final IUsuarioService service;
    public UsuarioController(IUsuarioService service) {
        this.service = service;
    }
    @PostMapping
    public ResponseEntity<UsuarioDTO> crear(@RequestBody UsuarioDTO dto) {
        UsuarioDTO created = service.save(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<UsuarioDTO>> listar() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @GetMapping("/nombre/{nombre}")
    public ResponseEntity<UsuarioDTO> obtenerPorNombre(@PathVariable String nombre) {
        return ResponseEntity.ok(service.findByUsername(nombre));
    }

    @GetMapping("/apellido/{apellido}")
    public ResponseEntity<UsuarioDTO> obtenerPorApellido(@PathVariable String apellido) {
        return ResponseEntity.ok(service.findByApellido(apellido));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioDTO> actualizar(@PathVariable Long id, @RequestBody UsuarioDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

}
