package com.revisionvehicular.backend.repositories.srtv;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface UsuarioRepository extends JpaRepository <Usuario,Long> {
    Optional<Usuario> findByUsuario(String usuario);
}


