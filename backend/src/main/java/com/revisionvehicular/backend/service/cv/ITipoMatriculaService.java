package com.revisionvehicular.backend.service.cv;

import com.revisionvehicular.backend.dtos.cv.TipoMatriculaDTO;
import java.util.List;

public interface ITipoMatriculaService {

    TipoMatriculaDTO save(TipoMatriculaDTO dto);

    TipoMatriculaDTO update(Long id, TipoMatriculaDTO dto);

    void delete(Long id);

    TipoMatriculaDTO findById(Long id);

    List<TipoMatriculaDTO> findAll();
}
