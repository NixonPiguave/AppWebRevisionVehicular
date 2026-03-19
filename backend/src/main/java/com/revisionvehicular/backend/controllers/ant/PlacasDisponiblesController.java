package com.revisionvehicular.backend.controllers.ant;

import com.revisionvehicular.backend.entities.ant.PlacaDisponible;
import com.revisionvehicular.backend.repositories.ant.IPlacaDisponibleRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/ant/placas-disponibles")
public class PlacasDisponiblesController {

    private final IPlacaDisponibleRepository repo;

    public PlacasDisponiblesController(IPlacaDisponibleRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public ResponseEntity<List<PlacaDisponible>> listarDisponibles() {
        return ResponseEntity.ok(repo.findByEstadoOrderByFechaRecepcionDesc("DISPONIBLE"));
    }
}

