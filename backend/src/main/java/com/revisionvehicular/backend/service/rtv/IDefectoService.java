package com.revisionvehicular.backend.service.rtv;

import com.revisionvehicular.backend.dtos.rtv.DefectoDTO;
import java.util.List;

public interface IDefectoService {

    DefectoDTO save(DefectoDTO dto);

    DefectoDTO update(Long id, DefectoDTO dto);

    void delete(Long id);

    DefectoDTO findById(Long id);

    List<DefectoDTO> findAll();
}