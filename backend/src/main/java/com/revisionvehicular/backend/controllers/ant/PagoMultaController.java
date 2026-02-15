package com.revisionvehicular.backend.controllers.ant;

import com.revisionvehicular.backend.dtos.ant.PagoMultaDTO;
import com.revisionvehicular.backend.service.ant.IPagoMultaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pago-multa")
public class PagoMultaController {

    private final IPagoMultaService service;

    public PagoMultaController(IPagoMultaService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Void> crear(@RequestBody PagoMultaDTO dto) {
        service.crear(dto);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> actualizar(@PathVariable Long id, @RequestBody PagoMultaDTO dto) {
        service.actualizar(id, dto);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<PagoMultaDTO>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PagoMultaDTO> buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
