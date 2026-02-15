package com.revisionvehicular.backend.service.cv;

import com.revisionvehicular.backend.dtos.cv.ModeloVehiculoDTO;

import java.util.List;

public interface IModeloVehiculoService {

    ModeloVehiculoDTO save(ModeloVehiculoDTO dto);

    ModeloVehiculoDTO update(Long id, ModeloVehiculoDTO dto);

    void delete(Long id);

    ModeloVehiculoDTO findById(Long id);

    List<ModeloVehiculoDTO> findAll();

    List<ModeloVehiculoDTO> findByMarca(Long idMarca);
}
