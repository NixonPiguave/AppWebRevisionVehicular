package com.revisionvehicular.backend.controllers.rtv;

import com.revisionvehicular.backend.dtos.rtv.RecargoCalendarizacionDTO;
import com.revisionvehicular.backend.service.rtv.IRecargoCalendarizacionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/recargo-calendarizacion")
public class RecargoCalendarizacionController {

    private final IRecargoCalendarizacionService service;

    public RecargoCalendarizacionController(IRecargoCalendarizacionService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<RecargoCalendarizacionDTO> obtener() {
        return ResponseEntity.ok(service.obtenerMontoRecargo());
    }

    @PutMapping
    public ResponseEntity<RecargoCalendarizacionDTO> actualizar(@RequestBody RecargoCalendarizacionDTO dto) {
        RecargoCalendarizacionDTO actualizado = service.actualizarMontoRecargo(dto.getMontoRecargo());
        return ResponseEntity.ok(actualizado);
    }
}
