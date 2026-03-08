package com.revisionvehicular.backend.service.rtv;

import com.revisionvehicular.backend.dtos.rtv.RegistroBaseUnicaVehiculoDTO;

import java.util.List;

public interface IRegistroBaseUnicaVehiculoService {
    RegistroBaseUnicaVehiculoDTO save(RegistroBaseUnicaVehiculoDTO dto);
    RegistroBaseUnicaVehiculoDTO update(Long id, RegistroBaseUnicaVehiculoDTO dto);
    void delete(Long id);
    RegistroBaseUnicaVehiculoDTO findById(Long id);
    List<RegistroBaseUnicaVehiculoDTO> findAll();
}
