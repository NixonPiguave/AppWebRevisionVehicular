package com.revisionvehicular.backend.service.rtv;

import com.revisionvehicular.backend.dtos.rtv.CrearInspeccionRequest;
import com.revisionvehicular.backend.dtos.rtv.InspeccionDTO;

import java.util.List;

public interface IInspeccionService {

    InspeccionDTO crear(CrearInspeccionRequest request);

    List<InspeccionDTO> listar();

    InspeccionDTO obtenerPorId(Long id);
}
