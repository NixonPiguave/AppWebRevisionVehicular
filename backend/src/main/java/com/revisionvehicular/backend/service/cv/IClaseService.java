package com.revisionvehicular.backend.service.cv;

import com.revisionvehicular.backend.dtos.cv.ClaseDTO;
import java.util.List;

public interface IClaseService {

    ClaseDTO save(ClaseDTO dto);

    ClaseDTO update(Long id, ClaseDTO dto);

    void delete(Long id);

    ClaseDTO findById(Long id);

    List<ClaseDTO> findAll();
}
