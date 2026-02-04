package com.revisionvehicular.backend.controllers.rtv;
import com.revisionvehicular.backend.dtos.rtv.EquipoDTO;
import com.revisionvehicular.backend.service.rtv.IEquiposService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/equipos")
public class EquipoController {

    private final IEquiposService equiposService;

    public EquipoController(IEquiposService equiposService) {
        this.equiposService = equiposService;
    }
    @PostMapping
    public ResponseEntity<EquipoDTO> addEquipo(@RequestBody EquipoDTO equipoDTO) {
        EquipoDTO creado = equiposService.save(equipoDTO);
        return new ResponseEntity<>(creado, HttpStatus.CREATED);
    }
    @GetMapping
    public ResponseEntity<List<EquipoDTO>> listarEquipos() {
        return ResponseEntity.ok(equiposService.findAll());
    }
    @GetMapping("/{id}")
    public ResponseEntity<EquipoDTO> obtenerEquipo(@PathVariable Long id) {
        return ResponseEntity.ok(equiposService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EquipoDTO> actualizarEquipo(@PathVariable Long id, @RequestBody EquipoDTO equipoDTO) {
        return ResponseEntity.ok(equiposService.update(id, equipoDTO));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarEquipo(@PathVariable Long id) {
        equiposService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
