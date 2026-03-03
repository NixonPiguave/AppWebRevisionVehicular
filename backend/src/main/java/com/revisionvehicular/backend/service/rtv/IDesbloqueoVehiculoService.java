package com.revisionvehicular.backend.service.rtv;

import com.revisionvehicular.backend.dtos.rtv.DesbloqueoVehiculoDTO;

import java.util.List;

public interface IDesbloqueoVehiculoService {

    DesbloqueoVehiculoDTO save(DesbloqueoVehiculoDTO dto);

    DesbloqueoVehiculoDTO update(Long id, DesbloqueoVehiculoDTO dto);

    void delete(Long id);

    DesbloqueoVehiculoDTO findById(Long id);

    List<DesbloqueoVehiculoDTO> findAll();
}

