package com.revisionvehicular.backend.service.rtv;

import com.revisionvehicular.backend.dtos.rtv.AnulacionTramiteServicioDTO;

import java.util.List;

public interface IAnulacionTramiteServicioService {
    AnulacionTramiteServicioDTO save(AnulacionTramiteServicioDTO dto);
    AnulacionTramiteServicioDTO update(Long id, AnulacionTramiteServicioDTO dto);
    void delete(Long id);
    AnulacionTramiteServicioDTO findById(Long id);
    List<AnulacionTramiteServicioDTO> findAll();
}
