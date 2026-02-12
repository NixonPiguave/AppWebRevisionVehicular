package com.revisionvehicular.backend.controllers.ant;

import com.revisionvehicular.backend.dtos.ant.DeudaVehicularDTO;
import com.revisionvehicular.backend.service.ant.IDeudaVehicularService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/deuda-vehicular")
public class DeudaVehicularController {

    private final IDeudaVehicularService service;

    public DeudaVehicularController(IDeudaVehicularService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Void> crear(@RequestBody DeudaVehicularDTO dto) {
        service.crear(dto);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> actualizar(@PathVariable Long id, @RequestBody DeudaVehicularDTO dto) {
        service.actualizar(id, dto);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<DeudaVehicularDTO>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeudaVehicularDTO> buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
