package com.revisionvehicular.backend.repositories.rtv;

import com.revisionvehicular.backend.entities.rtv.LineasEquipo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ILineasEquiposRepository extends JpaRepository<LineasEquipo, Long> {

    @Procedure(name = "sp_insertar_linea_equipo")
    void insertarLineaEquipo(
            @Param("p_linea_id") Long lineaId,
            @Param("p_equipo_id") Long equipoId
    );

    @Procedure(name = "sp_actualizar_linea_equipo")
    void actualizarLineaEquipo(
            @Param("p_linea_equipo_id") Long lineaEquipoId,
            @Param("p_linea_id") Long lineaId,
            @Param("p_equipo_id") Long equipoId
    );
}