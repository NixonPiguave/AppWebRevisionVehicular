package com.revisionvehicular.backend.controllers.ant;

import com.revisionvehicular.backend.service.ant.DeudaVehicularServiceImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/deuda-vehicular")
public class DeudaVehicularController {

    private final DeudaVehicularServiceImpl service;

    public DeudaVehicularController(DeudaVehicularServiceImpl service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Void> insertar(@RequestParam Long idVehiculo,@RequestParam Long idEntidad,@RequestParam String tipoDeuda,@RequestParam Integer periodo,@RequestParam LocalDate fechaVencimiento,@RequestParam BigDecimal montoOriginal,@RequestParam BigDecimal montoRecargo,@RequestParam BigDecimal montoTotal,@RequestParam BigDecimal montoPendiente,@RequestParam String estado,@RequestParam LocalDate fechaGeneracion) {
        service.insertar(idVehiculo,idEntidad,tipoDeuda,periodo,fechaVencimiento,montoOriginal,montoRecargo,montoTotal,montoPendiente,estado,fechaGeneracion);
        return ResponseEntity.ok().build();
    }

    @PutMapping
    public ResponseEntity<Void> modificar(@RequestParam Long idDeuda,@RequestParam Long idVehiculo,@RequestParam Long idEntidad,@RequestParam String tipoDeuda,@RequestParam Integer periodo,@RequestParam LocalDate fechaVencimiento,@RequestParam BigDecimal montoOriginal,@RequestParam BigDecimal montoRecargo,@RequestParam BigDecimal montoTotal,@RequestParam BigDecimal montoPendiente,@RequestParam String estado,@RequestParam LocalDate fechaGeneracion) {
        service.modificar(idDeuda,idVehiculo,idEntidad,tipoDeuda,periodo,fechaVencimiento,montoOriginal,montoRecargo,montoTotal,montoPendiente,estado,fechaGeneracion);
        return ResponseEntity.ok().build();
    }
}
