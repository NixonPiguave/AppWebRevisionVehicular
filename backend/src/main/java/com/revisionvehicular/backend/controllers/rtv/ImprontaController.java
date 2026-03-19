package com.revisionvehicular.backend.controllers.rtv;

import com.revisionvehicular.backend.dtos.rtv.ImprontaDTO;
import com.revisionvehicular.backend.entities.rtv.Impronta;
import com.revisionvehicular.backend.repositories.rtv.IImprontaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/improntas")
public class ImprontaController {

    private final IImprontaRepository repo;

    public ImprontaController(IImprontaRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public ResponseEntity<List<ImprontaDTO>> listar(@RequestParam(required = false) String placa) {
        List<Impronta> list;
        if (placa != null && !placa.isBlank()) {
            list = repo.findByVehiculo_MatriculaContainingIgnoreCase(placa.trim());
        } else {
            list = repo.findAll();
        }
        return ResponseEntity.ok(list.stream().map(this::toDTO).toList());
    }

    private ImprontaDTO toDTO(Impronta i) {
        ImprontaDTO dto = new ImprontaDTO();
        dto.setId(i.getImpronta_id());
        dto.setFechaRegistro(i.getFechaRegistro());
        dto.setCodigoImpronta(i.getCodigoImpronta());
        dto.setDescripcion(i.getDescripcion());
        dto.setEstado(i.getEstado());
        if (i.getVehiculo() != null) {
            dto.setVehiculoId(i.getVehiculo().getVehiculoid());
            dto.setPlaca(i.getVehiculo().getMatricula());
        }
        if (i.getEmpresa() != null) dto.setEmpresaId(i.getEmpresa().getEmpresaId());
        if (i.getUsuario() != null) dto.setUsuarioId(i.getUsuario().getUsuarioId());
        return dto;
    }
}

