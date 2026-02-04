package com.revisionvehicular.backend.service.cv;

import com.revisionvehicular.backend.dtos.cv.CategoriaDTO;


import java.util.List;


public interface ICategoriaService {
    CategoriaDTO save(CategoriaDTO categoriaDTO);
    List<CategoriaDTO> findAll();
    CategoriaDTO update(Long id,CategoriaDTO dto);
    void delete(Long id);
    CategoriaDTO findById(Long id);
}
