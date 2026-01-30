package com.revisionvehicular.backend.repositories.srtv;

import com.revisionvehicular.backend.entities.srtv.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface IUsuarioRepository extends JpaRepository <Usuario,Long> {
    Optional<Usuario> findByUsuarioId(Long usuarioId);
    Optional<Usuario> findByUsuario(String usuario);
    Optional<Usuario> findByNombre(String nombre);
    Optional<Usuario> findByEmail(String email);
    Optional<Usuario> findByApellido(String apellido);
}


