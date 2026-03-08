package com.revisionvehicular.backend.service.bund;

import com.revisionvehicular.backend.dtos.bund.IncidenteDTO;

import java.util.List;

public interface IIncidenteService {
    IncidenteDTO save(IncidenteDTO dto);
    IncidenteDTO update(Long id, IncidenteDTO dto);
    void delete(Long id);
    IncidenteDTO findById(Long id);
    List<IncidenteDTO> findAll();
}
