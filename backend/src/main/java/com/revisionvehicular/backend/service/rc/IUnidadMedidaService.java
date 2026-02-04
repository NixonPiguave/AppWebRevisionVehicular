package com.revisionvehicular.backend.service.rc;

import com.revisionvehicular.backend.dtos.rc.UnidadesMedidaDTO;

import java.util.List;

public interface IUnidadMedidaService {
    UnidadesMedidaDTO save(UnidadesMedidaDTO dto);
    UnidadesMedidaDTO update(Long id, UnidadesMedidaDTO dto);
    void delete(Long id);
    UnidadesMedidaDTO findById(Long id);
    List<UnidadesMedidaDTO> findAll();
}