package com.revisionvehicular.backend.service.rtv;

import com.revisionvehicular.backend.dtos.rtv.MetodoInspeccionDTO;
import java.util.List;

public interface IMetodoInspeccionService {

    MetodoInspeccionDTO save(MetodoInspeccionDTO dto);

    MetodoInspeccionDTO update(Long id, MetodoInspeccionDTO dto);

    void delete(Long id);

    MetodoInspeccionDTO findById(Long id);

    List<MetodoInspeccionDTO> findAll();
}
