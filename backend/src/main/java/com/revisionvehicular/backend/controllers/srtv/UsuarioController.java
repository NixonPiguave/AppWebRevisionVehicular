package com.revisionvehicular.backend.controllers.srtv;

import com.revisionvehicular.backend.dtos.srtv.UsuarioDTO;
import com.revisionvehicular.backend.service.srtv.AuditoriaService;
import com.revisionvehicular.backend.service.srtv.IUsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {
    private final IUsuarioService service;
    private final AuditoriaService auditoriaService;

    public UsuarioController(IUsuarioService service, AuditoriaService auditoriaService) {
        this.service = service;
        this.auditoriaService = auditoriaService;
    }

    @PostMapping
    public ResponseEntity<UsuarioDTO> crear(@RequestBody UsuarioDTO dto) {
        UsuarioDTO created = service.save(dto);
        auditoriaService.registrar("INSERT", "Usuario", dto.getUsuario() != null ? dto.getUsuario() : "id " + created.getUsuarioId());
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
        UsuarioDTO updated = service.update(id, dto);
        auditoriaService.registrar("UPDATE", "Usuario", "id " + id + (dto.getUsuario() != null ? " - " + dto.getUsuario() : ""));
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.delete(id);
        auditoriaService.registrar("DELETE", "Usuario", "id " + id);
        return ResponseEntity.noContent().build();
    }

}
