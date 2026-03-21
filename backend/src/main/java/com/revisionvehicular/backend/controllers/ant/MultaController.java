package com.revisionvehicular.backend.controllers.ant;

import com.revisionvehicular.backend.dtos.ant.MultaDTO;
import com.revisionvehicular.backend.dtos.ant.MultaRtvDetalleCompletoDTO;
import com.revisionvehicular.backend.dtos.ant.MultaRtvResumenFilaDTO;
import com.revisionvehicular.backend.service.ant.IMultaRtvConsultaService;
import com.revisionvehicular.backend.service.ant.IMultaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/multa")
public class MultaController {

    private final IMultaService service;
    private final IMultaRtvConsultaService multaRtvConsultaService;

    public MultaController(IMultaService service, IMultaRtvConsultaService multaRtvConsultaService) {
        this.service = service;
        this.multaRtvConsultaService = multaRtvConsultaService;
    }

    @GetMapping("/consulta-rtv-anual/resumen")
    public ResponseEntity<List<MultaRtvResumenFilaDTO>> resumenMultasNoPresentacionRtvAnual() {
        return ResponseEntity.ok(multaRtvConsultaService.listarResumenNoPresentacionRtvAnual());
    }

    @GetMapping("/consulta-rtv-anual/vehiculo/{vehiculoId}")
    public ResponseEntity<MultaRtvDetalleCompletoDTO> detalleMultasNoPresentacionRtvAnual(
            @PathVariable Long vehiculoId) {
        return multaRtvConsultaService.obtenerDetallePorVehiculo(vehiculoId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Void> crear(@RequestBody MultaDTO dto) {
        service.crear(dto);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> actualizar(@PathVariable Long id, @RequestBody MultaDTO dto) {
        service.actualizar(id, dto);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<MultaDTO>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MultaDTO> buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
