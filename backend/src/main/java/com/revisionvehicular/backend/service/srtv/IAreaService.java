package com.revisionvehicular.backend.service.srtv;

import com.revisionvehicular.backend.dtos.srtv.AreaDTO;

import java.util.List;

public interface IAreaService {
    AreaDTO save (AreaDTO dto);
    List<AreaDTO> findAll();
    AreaDTO update(Long id, AreaDTO dto);
    void delete(Long id);
    List<AreaDTO> findById(Long id);
}
