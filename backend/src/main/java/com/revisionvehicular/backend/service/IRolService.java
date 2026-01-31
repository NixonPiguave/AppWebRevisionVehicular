package com.revisionvehicular.backend.service;
import com.revisionvehicular.backend.dtos.srtv.RolDTO;

import java.util.List;

public interface IRolService {
    RolDTO save(RolDTO dto);
    RolDTO update(Long id,RolDTO dto);
    void delete(Long id);
    RolDTO findById(Long id);
    List<RolDTO> findAll();
}
