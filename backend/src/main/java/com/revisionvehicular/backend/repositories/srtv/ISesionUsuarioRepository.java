package com.revisionvehicular.backend.repositories.srtv;

import com.revisionvehicular.backend.entities.srtv.SesionUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ISesionUsuarioRepository extends JpaRepository<SesionUsuario, Long> {

    @org.springframework.data.jpa.repository.Query("SELECT s FROM SesionUsuario s JOIN FETCH s.usuario WHERE s.activo = true ORDER BY s.fechaLogin DESC")
    List<SesionUsuario> findByActivoTrueWithUsuario();

    Optional<SesionUsuario> findBySesionIdAndActivoTrue(Long sesionId);

    List<SesionUsuario> findByUsuario_UsuarioIdAndActivoTrue(Long usuarioId);

    @Modifying
    @Query("UPDATE SesionUsuario s SET s.activo = false WHERE s.sesionId = :sesionId")
    int cerrarSesionDirecto(@Param("sesionId") Long sesionId);
}
