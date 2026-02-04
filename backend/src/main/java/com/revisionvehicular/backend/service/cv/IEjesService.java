package com.revisionvehicular.backend.service.cv;

import com.revisionvehicular.backend.dtos.cv.EjesDTO;
import java.util.List;

public interface IEjesService {

    EjesDTO save(EjesDTO dto);

    EjesDTO update(Long id, EjesDTO dto);

    void delete(Long id);

    EjesDTO findById(Long id);

    List<EjesDTO> findAll();
}
