package com.revisionvehicular.backend.service.cv;

import com.revisionvehicular.backend.dtos.cv.SubcategoriaDTO;

import java.util.List;

public interface ISubcategoriaService {

    SubcategoriaDTO save(SubcategoriaDTO dto);

    SubcategoriaDTO update(Long id, SubcategoriaDTO dto);

    void delete(Long id);

    SubcategoriaDTO findById(Long id);

    List<SubcategoriaDTO> findAll();
}
