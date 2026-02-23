package com.revisionvehicular.backend.service.cv;

import com.revisionvehicular.backend.dtos.cv.VehiculoDTO;

import java.util.List;

public interface IVehiculoService {

    VehiculoDTO save(VehiculoDTO dto);

    VehiculoDTO update(Long id, VehiculoDTO dto);

    void delete(Long id);

    VehiculoDTO findById(Long id);

    List<VehiculoDTO> findAll();
}