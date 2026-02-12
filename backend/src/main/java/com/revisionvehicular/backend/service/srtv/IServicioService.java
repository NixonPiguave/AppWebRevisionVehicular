package com.revisionvehicular.backend.service.srtv;

import com.revisionvehicular.backend.dtos.srtv.ServicioDTO;

import java.util.List;

public interface IServicioService {

    ServicioDTO save(ServicioDTO dto);

    ServicioDTO update(Long id, ServicioDTO dto);

    void delete(Long id);

    ServicioDTO findById(Long id);

    List<ServicioDTO> findAll();
}
