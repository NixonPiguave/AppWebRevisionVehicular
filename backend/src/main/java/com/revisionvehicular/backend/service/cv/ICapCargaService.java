package com.revisionvehicular.backend.service.cv;

import com.revisionvehicular.backend.dtos.cv.CapCargaDTO;
import java.util.List;

public interface ICapCargaService {

    CapCargaDTO save(CapCargaDTO dto);

    CapCargaDTO update(Long id, CapCargaDTO dto);

    void delete(Long id);

    CapCargaDTO findById(Long id);

    List<CapCargaDTO> findAll();
}
