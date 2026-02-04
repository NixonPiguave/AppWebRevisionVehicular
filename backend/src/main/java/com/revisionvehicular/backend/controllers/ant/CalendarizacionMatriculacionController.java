package com.revisionvehicular.backend.controllers.ant;

import com.revisionvehicular.backend.dtos.ant.CalendarizacionMatriculacionDTO;
import com.revisionvehicular.backend.service.ant.ICalendarizacionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/calendarizacion-matriculacion")
public class CalendarizacionMatriculacionController {

    private final ICalendarizacionService service;

    public CalendarizacionMatriculacionController(ICalendarizacionService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<CalendarizacionMatriculacionDTO> crear(
            @RequestBody CalendarizacionMatriculacionDTO dto
    ) {
        CalendarizacionMatriculacionDTO creado = service.save(dto);
        return new ResponseEntity<>(creado, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<CalendarizacionMatriculacionDTO>> listar() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CalendarizacionMatriculacionDTO> obtenerPorId(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CalendarizacionMatriculacionDTO> actualizar(
            @PathVariable Long id,
            @RequestBody CalendarizacionMatriculacionDTO dto
    ) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id
    ) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}