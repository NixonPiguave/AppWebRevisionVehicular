package com.revisionvehicular.backend.controllers.rtv;

import com.revisionvehicular.backend.entities.rtv.TipoDefecto;
import com.revisionvehicular.backend.services.rtv.ITipoDefectoService;
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
    public ResponseEntity<Void> crear(@RequestBody TipoDefecto tipoDefecto) {
        tipoDefectoService.crearTipoDefecto(tipoDefecto);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> modificar(@PathVariable Long id, @RequestBody TipoDefecto tipoDefecto) {
        tipoDefectoService.modificarTipoDefecto(id, tipoDefecto);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<TipoDefecto>> listar() {
        return ResponseEntity.ok(tipoDefectoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TipoDefecto> buscarPorId(@PathVariable Long id) {
        return tipoDefectoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/codigo/{codigo}")
    public ResponseEntity<TipoDefecto> buscarPorCodigo(@PathVariable String codigo) {
        return tipoDefectoService.buscarPorCodigo(codigo)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
