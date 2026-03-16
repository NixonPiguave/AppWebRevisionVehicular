package com.revisionvehicular.backend.controllers.rtv;

import com.revisionvehicular.backend.dtos.rtv.MetodoInspeccionDTO;
import com.revisionvehicular.backend.service.rtv.IMetodoInspeccionService;
import com.revisionvehicular.backend.service.srtv.AuditoriaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/metodosinpeccion")
public class MetodoInspeccionController {

    private final IMetodoInspeccionService service;
    private final AuditoriaService auditoriaService;

    public MetodoInspeccionController(IMetodoInspeccionService service, AuditoriaService auditoriaService) {
        this.service = service;
        this.auditoriaService = auditoriaService;
    }

    @PostMapping
    public ResponseEntity<MetodoInspeccionDTO> crear(
            @RequestBody MetodoInspeccionDTO dto
    ){
        MetodoInspeccionDTO creado = service.save(dto);
        String detalle = dto.getNombre() != null ? dto.getNombre() : "id " + (creado.getId() != null ? creado.getId() : "");
        auditoriaService.registrar("INSERT", "Método inspección (visual/mecatrónica/gases)", detalle);
        return new ResponseEntity<>(creado, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<MetodoInspeccionDTO>> listar() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MetodoInspeccionDTO> obtenerPorId(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MetodoInspeccionDTO> actualizar(
            @PathVariable Long id,
            @RequestBody MetodoInspeccionDTO dto
    ) {
        MetodoInspeccionDTO actualizado = service.update(id, dto);
        auditoriaService.registrar("UPDATE", "Método inspección (visual/mecatrónica/gases)", "id " + id + (dto.getNombre() != null ? " - " + dto.getNombre() : ""));
        return ResponseEntity.ok(actualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id
    ) {
        service.delete(id);
        auditoriaService.registrar("DELETE", "Método inspección (visual/mecatrónica/gases)", "id " + id);
        return ResponseEntity.noContent().build();
    }
}
