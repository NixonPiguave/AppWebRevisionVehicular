package com.revisionvehicular.backend.controllers.ant;

import com.revisionvehicular.backend.dtos.ant.PagoDeudaVehicularDTO;
import com.revisionvehicular.backend.service.ant.IPagoDeudaVehicularService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pago-deuda-vehicular")
public class PagoDeudaVehicularController {

    private final IPagoDeudaVehicularService service;

    public PagoDeudaVehicularController(IPagoDeudaVehicularService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Void> crear(@RequestBody PagoDeudaVehicularDTO dto) {
        service.crear(dto);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> actualizar(@PathVariable Long id, @RequestBody PagoDeudaVehicularDTO dto) {
        service.actualizar(id, dto);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<PagoDeudaVehicularDTO>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PagoDeudaVehicularDTO> buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
