package com.revisionvehicular.backend.controllers.cv;

import com.revisionvehicular.backend.dtos.cv.AmbitoOperacionalDTO;
import com.revisionvehicular.backend.service.cv.IAmbitoOperacional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/ambito")
public class AmbitoOperacionalController {
    private final IAmbitoOperacional ambitoService;
    public AmbitoOperacionalController(IAmbitoOperacional ambitoService) {
        this.ambitoService = ambitoService;
    }
    @PostMapping
    public ResponseEntity<AmbitoOperacionalDTO> addAmbito(
            @RequestBody AmbitoOperacionalDTO dto
    ) {
        AmbitoOperacionalDTO creado = ambitoService.save(dto);
        return new ResponseEntity<>(creado, HttpStatus.CREATED);
    }
    @GetMapping
    public ResponseEntity<List<AmbitoOperacionalDTO>> listarAmbitos() {
        return ResponseEntity.ok(ambitoService.findAll());
    }
    @GetMapping("/{id}")
    public ResponseEntity<AmbitoOperacionalDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ambitoService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AmbitoOperacionalDTO> actualizarAmbito(@PathVariable Long id, @RequestBody AmbitoOperacionalDTO dto) {
        return ResponseEntity.ok(ambitoService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarAmbito(@PathVariable Long id) {
        ambitoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
