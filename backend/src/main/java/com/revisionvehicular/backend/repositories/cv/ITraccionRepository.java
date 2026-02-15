package com.revisionvehicular.backend.repositories.cv;

import com.revisionvehicular.backend.entities.cv.Traccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ITraccionRepository extends JpaRepository<Traccion, Long> {

    @Procedure(procedureName = "sp_insertar_traccion")
    void insertarTraccion(
            @Param("p_tipo") String tipo,
            @Param("p_descripcion") String descripcion,
            @Param("p_estado") String estado
    );

    @Procedure(procedureName = "sp_actualizar_traccion")
    void actualizarTraccion(
            @Param("p_traccionid") Long traccionid,
            @Param("p_tipo") String tipo,
            @Param("p_descripcion") String descripcion,
            @Param("p_estado") String estado
    );

    Optional<Traccion> getByTipo(String tipo);
}