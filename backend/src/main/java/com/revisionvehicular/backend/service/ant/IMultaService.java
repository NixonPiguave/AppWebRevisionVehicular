package com.revisionvehicular.backend.service.ant;

import com.revisionvehicular.backend.dtos.ant.MultaDTO;

import java.util.List;
import java.util.Optional;

public interface IMultaService {

    void crear(MultaDTO dto);

    void actualizar(Long id, MultaDTO dto);

    List<MultaDTO> listar();

    Optional<MultaDTO> buscarPorId(Long id);
}
