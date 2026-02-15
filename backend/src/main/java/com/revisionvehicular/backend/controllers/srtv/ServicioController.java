package com.revisionvehicular.backend.controllers.srtv;
import com.revisionvehicular.backend.dtos.srtv.ServicioDTO;
import com.revisionvehicular.backend.service.srtv.IServicioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("api/servicios")
public class ServicioController {

    private final IServicioService servicioService;

    public ServicioController(IServicioService servicioService) {
        this.servicioService = servicioService;
    }

    @PostMapping
    public ResponseEntity<ServicioDTO> addServicio(@RequestBody ServicioDTO servicioDTO) {
        ServicioDTO creado = servicioService.save(servicioDTO);
        return new ResponseEntity<>(creado, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ServicioDTO>> listarServicios() {
        return ResponseEntity.ok(servicioService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServicioDTO> obtenerServicioPorId(@PathVariable Long id) {
        return ResponseEntity.ok(servicioService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServicioDTO> actualizarServicio(
            @PathVariable Long id,
            @RequestBody ServicioDTO servicioDTO) {

        return ResponseEntity.ok(servicioService.update(id, servicioDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarServicio(@PathVariable Long id) {
        servicioService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
