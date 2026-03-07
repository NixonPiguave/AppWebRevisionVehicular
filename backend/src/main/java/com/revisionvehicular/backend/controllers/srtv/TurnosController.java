package com.revisionvehicular.backend.controllers.srtv;

import com.revisionvehicular.backend.dtos.srtv.TurnosDTO;
import com.revisionvehicular.backend.service.srtv.ITurnosService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/turnos")
public class TurnosController {

    private final ITurnosService service;

    public TurnosController(ITurnosService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<TurnosDTO> crear(
            @RequestBody TurnosDTO dto
    ) {
        TurnosDTO creado = service.save(dto);
        return new ResponseEntity<>(creado, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<TurnosDTO>> listar() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TurnosDTO> obtenerPorId(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TurnosDTO> actualizar(
            @PathVariable Long id,
            @RequestBody TurnosDTO dto
    ) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id
    ) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/pago")
    public ResponseEntity<TurnosDTO> registrarPago(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, java.math.BigDecimal> body
    ) {
        java.math.BigDecimal montoPagado = body.get("montoPagado");
        if (montoPagado == null) {
            return ResponseEntity.badRequest().build();
        }
        TurnosDTO actualizado = service.actualizarMontoPagado(id, montoPagado);
        return ResponseEntity.ok(actualizado);
    }
}