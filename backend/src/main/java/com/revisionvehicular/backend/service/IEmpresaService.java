package com.revisionvehicular.backend.service;

import com.revisionvehicular.backend.dtos.srtv.EmpresaDTO;

import java.util.List;

public interface IEmpresaService {
    EmpresaDTO save(EmpresaDTO p_empresaDTO);
    List<EmpresaDTO> findAll();
    EmpresaDTO update(Long id, EmpresaDTO dto);
    void delete(Long id);
}
