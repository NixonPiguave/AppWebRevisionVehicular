package com.revisionvehicular.backend.service.rtv;

import com.revisionvehicular.backend.dtos.rtv.FamiliaDTO;
import java.util.List;

public interface IFamiliaService {

    FamiliaDTO save(FamiliaDTO dto);

    FamiliaDTO update(Long id, FamiliaDTO dto);

    void delete(Long id);

    FamiliaDTO findById(Long id);

    List<FamiliaDTO> findAll();
}
