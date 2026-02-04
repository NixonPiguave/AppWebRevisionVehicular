package com.revisionvehicular.backend.services.rtv;

import com.revisionvehicular.backend.entities.rtv.TipoDefecto;

import java.util.List;
import java.util.Optional;

public interface ITipoDefectoService {

    void crearTipoDefecto(TipoDefecto tipoDefecto);

    void modificarTipoDefecto(Long id, TipoDefecto tipoDefecto);

    List<TipoDefecto> listarTodos();

    Optional<TipoDefecto> buscarPorId(Long id);

    Optional<TipoDefecto> buscarPorCodigo(String codigo);
}
