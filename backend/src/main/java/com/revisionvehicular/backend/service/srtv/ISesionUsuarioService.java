package com.revisionvehicular.backend.service.srtv;

import com.revisionvehicular.backend.dtos.srtv.SesionUsuarioDTO;
import com.revisionvehicular.backend.entities.srtv.Usuario;

import java.util.List;

public interface ISesionUsuarioService {

    SesionUsuarioDTO crearSesion(Usuario usuario);

    void cerrarSesionesDeUsuario(Long usuarioId);

    void cerrarSesion(Long sesionId);

    void cerrarSesionPorToken(String token);

    List<SesionUsuarioDTO> listarActivas();

    boolean isSesionActiva(Long sesionId);
}
