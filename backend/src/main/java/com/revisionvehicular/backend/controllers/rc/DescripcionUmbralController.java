package com.revisionvehicular.backend.controllers.rc;

import com.revisionvehicular.backend.dtos.rc.DescripcionUmbralDTO;
import com.revisionvehicular.backend.service.rc.IDescripcionUmbralService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/descripcionumbral")
public class DescripcionUmbralController {

    private final IDescripcionUmbralService service;

    public DescripcionUmbralController(
            IDescripcionUmbralService service) {
        this.service = service;
    }

    @PostMapping
    public DescripcionUmbralDTO crear(
            @RequestBody DescripcionUmbralDTO dto) {
        return service.save(dto);
    }

    @PutMapping("/{id}")
    public DescripcionUmbralDTO actualizar(
            @PathVariable Long id,
            @RequestBody DescripcionUmbralDTO dto) {
        return service.update(id, dto);
    }

    @GetMapping("/{id}")
    public DescripcionUmbralDTO obtenerPorId(
            @PathVariable Long id) {
        return service.findById(id);
    }

    @GetMapping
    public List<DescripcionUmbralDTO> listar() {
        return service.findAll();
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.delete(id);
    }
}