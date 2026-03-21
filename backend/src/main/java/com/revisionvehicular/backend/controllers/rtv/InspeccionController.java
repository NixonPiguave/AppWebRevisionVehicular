package com.revisionvehicular.backend.controllers.rtv;

import com.revisionvehicular.backend.dtos.rtv.CrearInspeccionRequest;
import com.revisionvehicular.backend.dtos.rtv.InspeccionDTO;
import com.revisionvehicular.backend.service.rtv.IInspeccionService;
import com.revisionvehicular.backend.service.srtv.AuditoriaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inspecciones")
public class InspeccionController {

    private final IInspeccionService service;
    private final AuditoriaService auditoriaService;

    public InspeccionController(IInspeccionService service, AuditoriaService auditoriaService) {
        this.service = service;
        this.auditoriaService = auditoriaService;
    }

    @PostMapping
    public ResponseEntity<InspeccionDTO> crear(@Valid @RequestBody CrearInspeccionRequest request) {
        InspeccionDTO creado = service.crear(request);
        String detalle = "vehículo " + request.getVehiculoId()
                + (request.getMetodoInspeccionId() != null ? ", método inspección id " + request.getMetodoInspeccionId() : "")
                + (creado.getId() != null ? " → inspección id " + creado.getId() : "");
        auditoriaService.registrar("INSERT", "Inspección (revisión)", detalle);
        return new ResponseEntity<>(creado, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<InspeccionDTO>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InspeccionDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.obtenerPorId(id));
    }
}
