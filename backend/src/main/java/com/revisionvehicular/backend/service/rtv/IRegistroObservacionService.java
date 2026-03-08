package com.revisionvehicular.backend.service.rtv;

import com.revisionvehicular.backend.dtos.rtv.RegistroObservacionDTO;

import java.util.List;

public interface IRegistroObservacionService {
    RegistroObservacionDTO save(RegistroObservacionDTO dto);
    RegistroObservacionDTO update(Long id, RegistroObservacionDTO dto);
    void delete(Long id);
    RegistroObservacionDTO findById(Long id);
    List<RegistroObservacionDTO> findAll();
}
