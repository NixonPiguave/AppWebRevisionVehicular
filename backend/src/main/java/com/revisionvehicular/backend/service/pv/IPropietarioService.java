package com.revisionvehicular.backend.service.pv;

import com.revisionvehicular.backend.dtos.pv.PropietarioDTO;
import java.util.List;

public interface IPropietarioService {

    PropietarioDTO save(PropietarioDTO dto);

    PropietarioDTO update(Long id, PropietarioDTO dto);

    void delete(Long id);

    PropietarioDTO findById(Long id);

    List<PropietarioDTO> findAll();
}
