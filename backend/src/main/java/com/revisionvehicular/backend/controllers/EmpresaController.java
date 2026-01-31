package com.revisionvehicular.backend.controllers;

import com.revisionvehicular.backend.dtos.srtv.EmpresaDTO;
import com.revisionvehicular.backend.entities.srtv.Empresa;
import com.revisionvehicular.backend.service.IEmpresaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("(api/empresa)")
public class EmpresaController {
    private final IEmpresaService service;
    public EmpresaController(IEmpresaService service) {
        this.service = service;
    }
    @PostMapping
    public ResponseEntity<EmpresaDTO> crear(@RequestBody EmpresaDTO dto){
        EmpresaDTO crear =service.save(dto);
        return new ResponseEntity<>(crear, HttpStatus.CREATED);
    }
    @GetMapping
    public ResponseEntity<List<EmpresaDTO>> listar(){
        return ResponseEntity.ok(service.findAll());
    }
    @PutMapping("/{id}")
    public ResponseEntity<EmpresaDTO> actualizar(@PathVariable Long id, @RequestBody EmpresaDTO dto){
        return ResponseEntity.ok(service.update(id, dto));
    }
    @DeleteMapping
    public ResponseEntity<Void> eliminar(@PathVariable Long id){
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
