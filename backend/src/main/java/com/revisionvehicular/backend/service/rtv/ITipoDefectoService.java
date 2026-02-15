package com.revisionvehicular.backend.service.rtv;

import com.revisionvehicular.backend.dtos.rtv.TipoDefectoDTO;

import java.util.List;
import java.util.Optional;

public interface ITipoDefectoService {

    // Retorna el DTO creado con ID
    TipoDefectoDTO crearTipoDefecto(TipoDefectoDTO tipoDefectoDTO);

    // Retorna el DTO modificado
    TipoDefectoDTO modificarTipoDefecto(Long id, TipoDefectoDTO tipoDefectoDTO);

    List<TipoDefectoDTO> listarTodos();

    Optional<TipoDefectoDTO> buscarPorId(Long id);

    Optional<TipoDefectoDTO> buscarPorCodigo(String codigo);
}