package com.revisionvehicular.backend.controllers;

import com.revisionvehicular.backend.dtos.srtv.RolDTO;
import com.revisionvehicular.backend.service.IRolService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/roles")
@CrossOrigin(origins = "http://localhost:4200")
public class RolController {
    private final IRolService rolService;
    public RolController(IRolService rolService) {
        this.rolService = rolService;
    }
    @PostMapping
    public ResponseEntity<RolDTO> addRol(@RequestBody RolDTO rolDTO) {
        RolDTO crear = rolService.save(rolDTO);
        return new ResponseEntity<>(crear,HttpStatus.CREATED);
    }
    @GetMapping
    public ResponseEntity<List<RolDTO>> listarRol(){
        return ResponseEntity.ok(rolService.findAll());
    }
    @PutMapping("/{id}")
    public ResponseEntity<RolDTO> actualizarRol(@PathVariable Long id, @RequestBody RolDTO rolDTO) {
        return ResponseEntity.ok(rolService.update(id ,rolDTO));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarRol(@PathVariable Long id) {
        rolService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
