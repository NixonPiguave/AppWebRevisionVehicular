package com.revisionvehicular.backend.controllers;

import com.revisionvehicular.backend.dtos.srtv.AreaDTO;
import com.revisionvehicular.backend.service.IAreaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/area")
//@CrossOrigin(origins = "http://localhost:4200")
public class AreaController {
    private final IAreaService service;
    public AreaController(IAreaService service) {
        this.service = service;
    }
    @PostMapping
    public ResponseEntity<AreaDTO> crear(@RequestBody AreaDTO dto){
        AreaDTO area = service.save(dto);
        return new ResponseEntity<>(area, HttpStatus.CREATED);
    }
    @GetMapping
    public ResponseEntity<List<AreaDTO>> listar(){
        return ResponseEntity.ok(service.findAll());
    }
    @PutMapping("/{id}")
    public ResponseEntity<AreaDTO> actualizar(@PathVariable Long id, @RequestBody AreaDTO dto){
        return ResponseEntity.ok(service.update(id,dto));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id){
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
