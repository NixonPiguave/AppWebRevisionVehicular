package com.revisionvehicular.backend.service.rtv;

import com.revisionvehicular.backend.dtos.rtv.LineasDTO;


import java.util.List;

public interface ILineaService {

    LineasDTO save(LineasDTO dto);

    LineasDTO update(Long id, LineasDTO dto);

    void delete(Long id);

    LineasDTO findById(Long id);

    List<LineasDTO> findAll();
}
