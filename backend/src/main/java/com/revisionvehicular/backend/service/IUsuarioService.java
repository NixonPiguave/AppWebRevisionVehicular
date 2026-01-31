package com.revisionvehicular.backend.service;

import com.revisionvehicular.backend.dtos.srtv.UsuarioDTO;

import java.util.List;

public interface IUsuarioService {
    UsuarioDTO save(UsuarioDTO usuarioDTO);
    List<UsuarioDTO> findAll();
    UsuarioDTO findById(Long id);
    UsuarioDTO findByUsername(String username);
    UsuarioDTO findByApellido(String apellido);
    UsuarioDTO update(Long id, UsuarioDTO usuarioDTO);
    void delete(Long id);
}
