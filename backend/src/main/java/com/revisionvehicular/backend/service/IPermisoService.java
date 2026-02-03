package com.revisionvehicular.backend.service;

import com.revisionvehicular.backend.dtos.srtv.PermisoDTO;

import java.util.List;

public interface IPermisoService {
    PermisoDTO save(PermisoDTO dto);
    PermisoDTO update(Long id, PermisoDTO dto);
    void delete(Long id);
    PermisoDTO findById(Long id);
    List<PermisoDTO> findAll();
}