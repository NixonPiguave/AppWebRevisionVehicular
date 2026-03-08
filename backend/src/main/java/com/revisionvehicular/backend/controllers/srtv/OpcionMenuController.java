package com.revisionvehicular.backend.controllers.srtv;

import com.revisionvehicular.backend.dtos.srtv.OpcionMenuDTO;
import com.revisionvehicular.backend.service.srtv.IOpcionMenuService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/opciones-menu")
public class OpcionMenuController {

    private final IOpcionMenuService opcionMenuService;

    public OpcionMenuController(IOpcionMenuService opcionMenuService) {
        this.opcionMenuService = opcionMenuService;
    }

    @GetMapping
    public ResponseEntity<List<OpcionMenuDTO>> listar() {
        return ResponseEntity.ok(opcionMenuService.findAll());
    }
}
