package com.revisionvehicular.backend.repositories.srtv;

import com.revisionvehicular.backend.entities.srtv.Usuario;
import com.revisionvehicular.backend.entities.srtv.UsuarioRoles;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IUsuarioRolesRepository extends JpaRepository<UsuarioRoles, Long> {
    List<UsuarioRoles> findByUsuario(Usuario usuario);
}
