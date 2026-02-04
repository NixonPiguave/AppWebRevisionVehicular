package com.revisionvehicular.backend.service.ant;

import com.revisionvehicular.backend.dtos.ant.EstadoMultaDTO;

import java.util.List;

public interface IEstadoMultaService {
    EstadoMultaDTO save(EstadoMultaDTO dto);
    EstadoMultaDTO update(Long id, EstadoMultaDTO dto);
    void delete(Long id);
    EstadoMultaDTO findById(Long id);
    List<EstadoMultaDTO> findAll();
}