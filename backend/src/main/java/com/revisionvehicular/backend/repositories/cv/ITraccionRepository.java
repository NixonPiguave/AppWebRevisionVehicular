package com.revisionvehicular.backend.repositories.cv;

import com.revisionvehicular.backend.entities.cv.Traccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ITraccionRepository extends JpaRepository<Traccion, Long> {

    @Procedure(name = "sp_insertar_traccion")
    Long insertarTraccion(
            @Param("tipo") String tipo,
            @Param("descripcion") String descripcion,
            @Param("estado") String estado
    );

    @Procedure(name = "sp_actualizar_traccion")
    void actualizarTraccion(
            @Param("traccionid") Long traccionid,
            @Param("tipo") String tipo,
            @Param("descripcion") String descripcion,
            @Param("estado") String estado
    );
}