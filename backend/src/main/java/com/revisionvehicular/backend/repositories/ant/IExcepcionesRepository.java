package com.revisionvehicular.backend.repositories.ant;

import com.revisionvehicular.backend.entities.ant.Excepciones;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface IExcepcionesRepository extends JpaRepository<Excepciones, Long> {

    @Procedure(name = "sp_insertar_excepcion")
    void insertarExcepcion(
            @Param("p_codigo") String codigo,
            @Param("p_descripcion") String descripcion,
            @Param("p_finaliza") String finaliza,
            @Param("p_estado") String estado
    );

    @Procedure(name = "sp_actualizar_excepcion")
    void actualizarExcepcion(
            @Param("p_id_estado_excepcion") Long idEstadoExcepcion,
            @Param("p_codigo") String codigo,
            @Param("p_descripcion") String descripcion,
            @Param("p_finaliza") String finaliza,
            @Param("p_estado") String estado
    );
}