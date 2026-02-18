package com.revisionvehicular.backend.service.rc;

import com.revisionvehicular.backend.dtos.rc.UmbralDTO;

import java.util.List;

public interface IUmbralService {

    UmbralDTO save(UmbralDTO dto);

    UmbralDTO update(Long id, UmbralDTO dto);

    void delete(Long id);

    UmbralDTO findById(Long id);

    List<UmbralDTO> findAll();
}
