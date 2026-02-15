package com.revisionvehicular.backend.controllers.ant;

import com.revisionvehicular.backend.dtos.ant.TipoDeudaVehicularDTO;
import com.revisionvehicular.backend.service.ant.ITipoDeudaVehicularService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tipo-deuda-vehicular")
public class TipoDeudaVehicularController {

    private final ITipoDeudaVehicularService service;

    public TipoDeudaVehicularController(ITipoDeudaVehicularService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Void> crear(@RequestBody TipoDeudaVehicularDTO dto) {
        service.crear(dto);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> actualizar(@PathVariable Long id, @RequestBody TipoDeudaVehicularDTO dto) {
        service.actualizar(id, dto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<TipoDeudaVehicularDTO>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TipoDeudaVehicularDTO> buscar(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
