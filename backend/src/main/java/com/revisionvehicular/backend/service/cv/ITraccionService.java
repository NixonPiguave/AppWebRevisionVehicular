package com.revisionvehicular.backend.service.cv;

import com.revisionvehicular.backend.dtos.cv.TraccionDTO;
import java.util.List;

public interface ITraccionService {

    TraccionDTO save(TraccionDTO dto);

    TraccionDTO update(Long id, TraccionDTO dto);

    void delete(Long id);

    TraccionDTO findById(Long id);

    List<TraccionDTO> findAll();
}
