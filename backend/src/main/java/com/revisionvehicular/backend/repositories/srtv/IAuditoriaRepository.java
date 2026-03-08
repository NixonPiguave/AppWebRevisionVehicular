package com.revisionvehicular.backend.repositories.srtv;

import com.revisionvehicular.backend.entities.srtv.Auditoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IAuditoriaRepository extends JpaRepository<Auditoria, Long> {

    List<Auditoria> findByUsuario_UsuarioIdOrderByFechaDesc(Long usuarioId);

    List<Auditoria> findAllByOrderByFechaDesc();

    List<Auditoria> findByUsuario_UsuarioIdInOrderByFechaDesc(List<Long> usuarioIds);
}
