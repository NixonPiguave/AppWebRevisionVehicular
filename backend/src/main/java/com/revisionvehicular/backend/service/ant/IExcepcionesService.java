package com.revisionvehicular.backend.service.ant;

import com.revisionvehicular.backend.dtos.ant.ExcepcionesDTO;

import java.util.List;

public interface IExcepcionesService {
    ExcepcionesDTO save(ExcepcionesDTO dto);
    ExcepcionesDTO update(Long id, ExcepcionesDTO dto);
    void delete(Long id);
    ExcepcionesDTO findById(Long id);
    List<ExcepcionesDTO> findAll();
}