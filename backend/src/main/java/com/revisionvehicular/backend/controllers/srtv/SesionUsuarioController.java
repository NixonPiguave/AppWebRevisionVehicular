package com.revisionvehicular.backend.controllers.srtv;

import com.revisionvehicular.backend.dtos.srtv.SesionUsuarioDTO;
import com.revisionvehicular.backend.service.srtv.ISesionUsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/sesiones-usuarios")
public class SesionUsuarioController {

    private final ISesionUsuarioService sesionUsuarioService;

    public SesionUsuarioController(ISesionUsuarioService sesionUsuarioService) {
        this.sesionUsuarioService = sesionUsuarioService;
    }

    @GetMapping("/activos")
    public ResponseEntity<List<SesionUsuarioDTO>> listarActivas() {
        return ResponseEntity.ok(sesionUsuarioService.listarActivas());
    }

    @PostMapping("/{sesionId}/cerrar")
    public ResponseEntity<Void> cerrarSesion(@PathVariable Long sesionId) {
        sesionUsuarioService.cerrarSesion(sesionId);
        return ResponseEntity.noContent().build();
    }
}
