package com.revisionvehicular.backend.service.rtv;

import com.revisionvehicular.backend.dtos.rtv.BajaVehiculoDTO;

import java.util.List;

public interface IBajaVehiculoService {

    BajaVehiculoDTO save(BajaVehiculoDTO dto);

    BajaVehiculoDTO update(Long id, BajaVehiculoDTO dto);

    void delete(Long id);

    BajaVehiculoDTO findById(Long id);

    List<BajaVehiculoDTO> findAll();
}

