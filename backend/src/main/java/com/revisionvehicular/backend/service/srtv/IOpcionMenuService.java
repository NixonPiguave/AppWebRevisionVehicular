package com.revisionvehicular.backend.service.srtv;

import com.revisionvehicular.backend.dtos.srtv.OpcionMenuDTO;
import com.revisionvehicular.backend.entities.srtv.Usuario;

import java.util.List;

public interface IOpcionMenuService {

    List<OpcionMenuDTO> findAll();

    List<Long> getOpcionMenuIdsByRolId(Long rolId);

    void setOpcionesMenuForRol(Long rolId, List<Long> opcionMenuIds);

    List<String> getOpcionMenuClavesByUsuario(Usuario usuario);
}
