package com.revisionvehicular.backend.service.rtv;

import com.revisionvehicular.backend.dtos.rtv.EquipoDTO;

import java.util.List;

public interface IEquiposService {
    EquipoDTO save(EquipoDTO dto);
    EquipoDTO update(Long id,EquipoDTO dto);
    void delete(Long id);
    EquipoDTO findById(Long id);
    List<EquipoDTO> findAll();
}
