package com.revisionvehicular.backend.service.cv;

import com.revisionvehicular.backend.dtos.cv.MarcaVehiculoDTO;
import java.util.List;

public interface IMarcaVehiculoService {
    MarcaVehiculoDTO save(MarcaVehiculoDTO dto);
    MarcaVehiculoDTO update(Long id, MarcaVehiculoDTO dto);
    void delete(Long id);
    MarcaVehiculoDTO findById(Long id);
    List<MarcaVehiculoDTO> findAll();
}
