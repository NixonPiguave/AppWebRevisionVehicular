package com.revisionvehicular.backend.service.rtv;

import com.revisionvehicular.backend.dtos.rtv.BloqueoVehiculoDTO;

import java.util.List;

public interface IBloqueoVehiculoService {

    BloqueoVehiculoDTO save(BloqueoVehiculoDTO dto);

    BloqueoVehiculoDTO update(Long id, BloqueoVehiculoDTO dto);

    void delete(Long id);

    BloqueoVehiculoDTO findById(Long id);

    List<BloqueoVehiculoDTO> findAll();
}

