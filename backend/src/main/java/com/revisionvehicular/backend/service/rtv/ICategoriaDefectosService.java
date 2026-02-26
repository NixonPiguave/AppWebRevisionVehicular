package com.revisionvehicular.backend.service.rtv;

import com.revisionvehicular.backend.dtos.rtv.CategoriaDTO;

import java.util.List;

public interface ICategoriaDefectosService {

    CategoriaDTO save(CategoriaDTO dto);

    CategoriaDTO update(Long id, CategoriaDTO dto);

    void delete(Long id);

    CategoriaDTO findById(Long id);

    List<CategoriaDTO> findAll();
}
