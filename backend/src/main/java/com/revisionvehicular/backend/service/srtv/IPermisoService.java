package com.revisionvehicular.backend.service.srtv;

import com.revisionvehicular.backend.dtos.srtv.PermisoDTO;
import java.util.List;

public interface IPermisoService {
    List<PermisoDTO> findAll();
}