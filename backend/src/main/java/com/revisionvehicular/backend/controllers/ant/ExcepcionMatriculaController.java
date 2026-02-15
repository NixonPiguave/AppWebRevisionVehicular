package com.revisionvehicular.backend.controllers.ant;

import com.revisionvehicular.backend.service.ant.IExcepcionMatriculaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/excepcion-matricula")
public class ExcepcionMatriculaController {

    private final IExcepcionMatriculaService service;

    public ExcepcionMatriculaController(IExcepcionMatriculaService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Void> insertar(@RequestParam Long idEstadoExcepcion,@RequestParam LocalDate fechaInicio,@RequestParam(required = false) LocalDate fechaFin,@RequestParam(required = false) String articuloLegal,@RequestParam(required = false) String observacion,@RequestParam String estado) {
        service.insertar(idEstadoExcepcion,fechaInicio,fechaFin,articuloLegal,observacion,estado);
        return ResponseEntity.ok().build();
    }

    @PutMapping
    public ResponseEntity<Void> modificar(@RequestParam Long idExcepcion,@RequestParam Long idEstadoExcepcion,@RequestParam LocalDate fechaInicio,@RequestParam(required = false) LocalDate fechaFin,@RequestParam(required = false) String articuloLegal,@RequestParam(required = false) String observacion,@RequestParam String estado) {
        service.modificar(idExcepcion,idEstadoExcepcion,fechaInicio,fechaFin,articuloLegal,observacion,estado);
        return ResponseEntity.ok().build();
    }
}
