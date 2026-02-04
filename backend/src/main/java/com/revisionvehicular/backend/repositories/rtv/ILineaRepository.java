package com.revisionvehicular.backend.repositories.rtv;

import com.revisionvehicular.backend.entities.rtv.Lineas;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ILineaRepository extends JpaRepository<Lineas, Long> {

    @Procedure(name = "sp_insertar_linea")
    void insertarLinea(
            @Param("p_nombre") String nombre,
            @Param("p_descripcion") String descripcion,
            @Param("p_estado") String estado
    );

    @Procedure(name = "sp_actualizar_linea")
    void actualizarLinea(
            @Param("p_linea_id") Long lineaId,
            @Param("p_nombre") String nombre,
            @Param("p_descripcion") String descripcion,
            @Param("p_estado") String estado
    );
}