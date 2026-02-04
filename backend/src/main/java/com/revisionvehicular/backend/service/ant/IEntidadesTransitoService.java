package com.revisionvehicular.backend.service.ant;

import com.revisionvehicular.backend.dtos.ant.EntidadesTransitoDTO;
import java.util.List;

public interface IEntidadesTransitoService {

    EntidadesTransitoDTO save(EntidadesTransitoDTO dto);

    EntidadesTransitoDTO update(Long id, EntidadesTransitoDTO dto);

    void delete(Long id);

    EntidadesTransitoDTO findById(Long id);

    List<EntidadesTransitoDTO> findAll();
}
