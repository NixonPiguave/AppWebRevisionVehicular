package com.revisionvehicular.backend.service.srtv;

import com.revisionvehicular.backend.dtos.srtv.TurnosDTO;

import java.util.List;

public interface ITurnosService {
    TurnosDTO save(TurnosDTO dto);
    TurnosDTO update(Long id, TurnosDTO dto);
    void delete(Long id);
    TurnosDTO findById(Long id);
    List<TurnosDTO> findAll();
}