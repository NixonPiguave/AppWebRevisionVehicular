package com.revisionvehicular.backend.service.cv;

import com.revisionvehicular.backend.dtos.cv.TipoCombustibleDTO;
import java.util.List;

public interface ITipoCombustibleService {

    TipoCombustibleDTO save(TipoCombustibleDTO dto);

    TipoCombustibleDTO update(Long id, TipoCombustibleDTO dto);

    void delete(Long id);

    TipoCombustibleDTO findById(Long id);

    List<TipoCombustibleDTO> findAll();
}
