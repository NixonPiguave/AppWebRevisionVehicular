package com.revisionvehicular.backend.repositories.srtv;

import com.revisionvehicular.backend.entities.srtv.Auditoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IAuditoriaRepository extends JpaRepository<Auditoria, Long> {

    List<Auditoria> findByUsuario_UsuarioIdOrderByFechaDesc(Long usuarioId);

    List<Auditoria> findByUsuario_UsuarioIdAndTipoAccionOrderByFechaDesc(Long usuarioId, String tipoAccion);

    List<Auditoria> findAllByOrderByFechaDesc();

    List<Auditoria> findAllByTipoAccionOrderByFechaDesc(String tipoAccion);

    List<Auditoria> findByUsuario_UsuarioIdInOrderByFechaDesc(List<Long> usuarioIds);

    List<Auditoria> findByUsuario_UsuarioIdInAndTipoAccionOrderByFechaDesc(List<Long> usuarioIds, String tipoAccion);
}
