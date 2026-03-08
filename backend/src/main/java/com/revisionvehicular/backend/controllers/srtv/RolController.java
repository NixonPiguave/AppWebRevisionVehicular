package com.revisionvehicular.backend.controllers.srtv;

import com.revisionvehicular.backend.dtos.srtv.RolDTO;
import com.revisionvehicular.backend.service.srtv.IOpcionMenuService;
import com.revisionvehicular.backend.service.srtv.IRolService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/roles")
//@CrossOrigin(origins = "http://localhost:4200")
public class RolController {
    private final IRolService rolService;
    private final IOpcionMenuService opcionMenuService;

    public RolController(IRolService rolService, IOpcionMenuService opcionMenuService) {
        this.rolService = rolService;
        this.opcionMenuService = opcionMenuService;
    }
    @PostMapping
    public ResponseEntity<RolDTO> addRol(@RequestBody RolDTO rolDTO) {
        RolDTO crear = rolService.save(rolDTO);
        return new ResponseEntity<>(crear,HttpStatus.CREATED);
    }
    @GetMapping
    public ResponseEntity<List<RolDTO>> listarRol(){
        return ResponseEntity.ok(rolService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RolDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(rolService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RolDTO> actualizarRol(@PathVariable Long id, @RequestBody RolDTO rolDTO) {
        return ResponseEntity.ok(rolService.update(id ,rolDTO));
    }

    /** Actualiza únicamente las opciones de menú visibles para el rol (tabla srtv_rol_opcion_menu). */
    @PutMapping("/{id}/opciones-menu")
    public ResponseEntity<Void> actualizarOpcionesMenu(@PathVariable Long id, @RequestBody List<Long> opcionMenuIds) {
        opcionMenuService.setOpcionesMenuForRol(id, opcionMenuIds != null ? opcionMenuIds : List.of());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarRol(@PathVariable Long id) {
        rolService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
