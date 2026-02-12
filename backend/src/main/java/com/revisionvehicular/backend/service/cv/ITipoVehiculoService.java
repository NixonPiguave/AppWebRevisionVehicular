package com.revisionvehicular.backend.service.cv;

import com.revisionvehicular.backend.dtos.cv.TipoVehiculoDTO;

import java.util.List;

public interface ITipoVehiculoService {

    TipoVehiculoDTO save(TipoVehiculoDTO dto);

    TipoVehiculoDTO update(Long id, TipoVehiculoDTO dto);

    void delete(Long id);

    TipoVehiculoDTO findById(Long id);

    List<TipoVehiculoDTO> findAll();
}
