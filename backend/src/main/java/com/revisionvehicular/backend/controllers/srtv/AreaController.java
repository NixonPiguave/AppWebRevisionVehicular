package com.revisionvehicular.backend.controllers.srtv;

import com.revisionvehicular.backend.dtos.srtv.AreaDTO;
import com.revisionvehicular.backend.service.srtv.AuditoriaService;
import com.revisionvehicular.backend.service.srtv.IAreaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/area")
public class AreaController {
    private final IAreaService service;
    private final AuditoriaService auditoriaService;

    public AreaController(IAreaService service, AuditoriaService auditoriaService) {
        this.service = service;
        this.auditoriaService = auditoriaService;
    }

    @PostMapping
    public ResponseEntity<AreaDTO> crear(@RequestBody AreaDTO dto){
        AreaDTO area = service.save(dto);
        auditoriaService.registrar("INSERT", "Área", dto.getNombre() != null ? dto.getNombre() : "id " + area.getAreaId());
        return new ResponseEntity<>(area, HttpStatus.CREATED);
    }
    @GetMapping
    public ResponseEntity<List<AreaDTO>> listar(){
        return ResponseEntity.ok(service.findAll());
    }
    @PutMapping("/{id}")
    public ResponseEntity<AreaDTO> actualizar(@PathVariable Long id, @RequestBody AreaDTO dto){
        AreaDTO updated = service.update(id, dto);
        auditoriaService.registrar("UPDATE", "Área", "id " + id + (dto.getNombre() != null ? " - " + dto.getNombre() : ""));
        return ResponseEntity.ok(updated);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id){
        service.delete(id);
        auditoriaService.registrar("DELETE", "Área", "id " + id);
        return ResponseEntity.noContent().build();
    }
}
