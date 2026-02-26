package com.revisionvehicular.backend.service.ant;

import com.revisionvehicular.backend.dtos.ant.TarifarioDTO;

import java.util.List;
import java.util.Optional;

public interface ITarifarioService {

    void crear(TarifarioDTO dto);

    void actualizar(Long id, TarifarioDTO dto);

    List<TarifarioDTO> listar();

    Optional<TarifarioDTO> buscarPorId(Long id);
}
