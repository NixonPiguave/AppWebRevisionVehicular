package com.revisionvehicular.backend.controllers.cv;

import com.revisionvehicular.backend.dtos.cv.DatosFabricaDTO;
import com.revisionvehicular.backend.service.cv.IDatosFabricaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/datos-fabrica")
public class DatosFabricaController {

    private final IDatosFabricaService service;

    public DatosFabricaController(IDatosFabricaService service) {
        this.service = service;
    }

    /**
     * Busca datos de fábrica por matrícula (placa).
     * Usado en inspección visual para comparar con datos del vehículo registrado.
     */
    @GetMapping("/buscar")
    public ResponseEntity<DatosFabricaDTO> buscarPorMatricula(
            @RequestParam(value = "matricula", required = false) String matricula) {
        if (matricula == null || matricula.isBlank()) {
            return ResponseEntity.notFound().build();
        }
        return service.buscarPorMatricula(matricula)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
