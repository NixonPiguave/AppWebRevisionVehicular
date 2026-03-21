package com.revisionvehicular.backend.controllers.rtv;

import com.revisionvehicular.backend.dtos.rtv.CriterioResultadoDTO;
import com.revisionvehicular.backend.service.rtv.ICriterioResultadoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/criterio-resultado")
public class CriterioResultadoController {

    private final ICriterioResultadoService service;

    public CriterioResultadoController(ICriterioResultadoService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<CriterioResultadoDTO> obtener() {
        return ResponseEntity.ok(service.obtenerConfig());
    }

    @PutMapping
    public ResponseEntity<CriterioResultadoDTO> guardar(@RequestBody CriterioResultadoDTO dto) {
        return ResponseEntity.ok(service.guardar(dto));
    }
}
