package com.revisionvehicular.backend.service.ant;

import com.revisionvehicular.backend.dtos.ant.TipoBloqueoDTO;

import java.util.List;

public interface ITipoBloqueoService {

    List<TipoBloqueoDTO> findAll();

    TipoBloqueoDTO findById(Long id);

    List<String> findDistinctInstituciones();
}
