package com.revisionvehicular.backend.service.rtv;

import com.revisionvehicular.backend.dtos.rtv.SubfamiliaDTO;
import java.util.List;

public interface ISubFamiliaService {

    SubfamiliaDTO save(SubfamiliaDTO dto);

    SubfamiliaDTO update(Long id, SubfamiliaDTO dto);

    void delete(Long id);

    SubfamiliaDTO findById(Long id);

    List<SubfamiliaDTO> findAll();
}