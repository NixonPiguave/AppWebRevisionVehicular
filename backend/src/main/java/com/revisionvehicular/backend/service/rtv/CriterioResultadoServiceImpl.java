package com.revisionvehicular.backend.service.rtv;

import com.revisionvehicular.backend.dtos.rtv.CriterioResultadoDTO;
import com.revisionvehicular.backend.entities.rtv.CriterioResultado;
import com.revisionvehicular.backend.repositories.rtv.ICriterioResultadoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CriterioResultadoServiceImpl implements ICriterioResultadoService {

    private final ICriterioResultadoRepository repository;

    public CriterioResultadoServiceImpl(ICriterioResultadoRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional(readOnly = true)
    public CriterioResultadoDTO obtenerConfig() {
        CriterioResultado c = repository.findTopByOrderByCriterioIdDesc();
        if (c == null) {
            CriterioResultadoDTO dto = new CriterioResultadoDTO();
            dto.setTipo1Rechaza(false);
            dto.setTipo2Rechaza(true);
            dto.setTipo3Rechaza(true);
            dto.setTipo2Max(0);
            dto.setTipo3Max(0);
            return dto;
        }
        return toDTO(c);
    }

    @Override
    @Transactional
    public CriterioResultadoDTO guardar(CriterioResultadoDTO dto) {
        validarMax(dto.getTipo1Max(), "Tipo 1");
        validarMax(dto.getTipo2Max(), "Tipo 2");
        validarMax(dto.getTipo3Max(), "Tipo 3");

        CriterioResultado c = repository.findTopByOrderByCriterioIdDesc();
        if (c == null) {
            c = new CriterioResultado();
        }
        c.setTipo1Rechaza(Boolean.TRUE.equals(dto.getTipo1Rechaza()));
        c.setTipo2Rechaza(dto.getTipo2Rechaza() == null || dto.getTipo2Rechaza());
        c.setTipo3Rechaza(dto.getTipo3Rechaza() == null || dto.getTipo3Rechaza());
        c.setTipo1Max(dto.getTipo1Max());
        c.setTipo2Max(dto.getTipo2Max());
        c.setTipo3Max(dto.getTipo3Max());
        c.setDescripcion(dto.getDescripcion());
        CriterioResultado guardado = repository.save(c);
        return toDTO(guardado);
    }

    private void validarMax(Integer valor, String tipo) {
        if (valor == null) return;
        if (valor < 0) {
            throw new IllegalArgumentException("La cantidad máxima permitida para " + tipo + " no puede ser negativa.");
        }
    }


    @Override
    @Transactional(readOnly = true)
    public boolean debeRechazar(int totalTipo1, int totalTipo2, int totalTipo3) {
        CriterioResultado c = repository.findTopByOrderByCriterioIdDesc();
        if (c == null) {
            return totalTipo2 > 0 || totalTipo3 > 0; // Comportamiento por defecto
        }
        int max1 = c.getTipo1Max() != null ? c.getTipo1Max() : 0;
        int max2 = c.getTipo2Max() != null ? c.getTipo2Max() : 0;
        int max3 = c.getTipo3Max() != null ? c.getTipo3Max() : 0;
        if (Boolean.TRUE.equals(c.getTipo1Rechaza()) && totalTipo1 > max1) return true;
        if (Boolean.TRUE.equals(c.getTipo2Rechaza()) && totalTipo2 > max2) return true;
        if (Boolean.TRUE.equals(c.getTipo3Rechaza()) && totalTipo3 > max3) return true;
        return false;
    }

    private CriterioResultadoDTO toDTO(CriterioResultado c) {
        CriterioResultadoDTO dto = new CriterioResultadoDTO();
        dto.setCriterioId(c.getCriterioId());
        dto.setTipo1Rechaza(c.getTipo1Rechaza());
        dto.setTipo2Rechaza(c.getTipo2Rechaza());
        dto.setTipo3Rechaza(c.getTipo3Rechaza());
        dto.setTipo1Max(c.getTipo1Max());
        dto.setTipo2Max(c.getTipo2Max());
        dto.setTipo3Max(c.getTipo3Max());
        dto.setDescripcion(c.getDescripcion());
        return dto;
    }
}
