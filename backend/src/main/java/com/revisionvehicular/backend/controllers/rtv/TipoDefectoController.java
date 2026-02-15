package com.revisionvehicular.backend.controllers.rtv;

import com.revisionvehicular.backend.dtos.rtv.TipoDefectoDTO;
import com.revisionvehicular.backend.service.rtv.ITipoDefectoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tipodefecto")
public class TipoDefectoController {

    private final ITipoDefectoService tipoDefectoService;

    public TipoDefectoController(ITipoDefectoService tipoDefectoService) {
        this.tipoDefectoService = tipoDefectoService;
    }

    @PostMapping
    public ResponseEntity<TipoDefectoDTO> crear(@RequestBody TipoDefectoDTO tipoDefectoDTO) {
        // Crear el tipo de defecto
        TipoDefectoDTO creado = tipoDefectoService.crearTipoDefecto(tipoDefectoDTO);
        // Retornar el objeto completo con ID
        return ResponseEntity.ok(creado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TipoDefectoDTO> modificar(@PathVariable Long id, @RequestBody TipoDefectoDTO tipoDefectoDTO) {
        // Modificar el tipo de defecto
        TipoDefectoDTO modificado = tipoDefectoService.modificarTipoDefecto(id, tipoDefectoDTO);
        // Retornar el objeto actualizado
        return ResponseEntity.ok(modificado);
    }

    @GetMapping
    public ResponseEntity<List<TipoDefectoDTO>> listar() {
        return ResponseEntity.ok(tipoDefectoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TipoDefectoDTO> buscarPorId(@PathVariable Long id) {
        return tipoDefectoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/codigo/{codigo}")
    public ResponseEntity<TipoDefectoDTO> buscarPorCodigo(@PathVariable String codigo) {
        return tipoDefectoService.buscarPorCodigo(codigo)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}