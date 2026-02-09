package com.revisionvehicular.backend.repositories.ant;

import com.revisionvehicular.backend.entities.ant.ExcepcionMatricula;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;

public interface ExcepcionMatriculaRepository extends JpaRepository<ExcepcionMatricula, Long> {

    @Procedure(procedureName = "sp_insert_ant_excepcion_matricula_vehiculo")
    void insertar(
            @Param("p_id_estado_excepcion") Long idEstadoExcepcion,
            @Param("p_fecha_inicio") LocalDate fechaInicio,
            @Param("p_fecha_fin") LocalDate fechaFin,
            @Param("p_articulo_legal") String articuloLegal,
            @Param("p_observacion") String observacion,
            @Param("p_estado") String estado
    );

    @Procedure(procedureName = "sp_update_ant_excepcion_matricula_vehiculo")
    void modificar(
            @Param("p_id_excepcion") Long idExcepcion,
            @Param("p_id_estado_excepcion") Long idEstadoExcepcion,
            @Param("p_fecha_inicio") LocalDate fechaInicio,
            @Param("p_fecha_fin") LocalDate fechaFin,
            @Param("p_articulo_legal") String articuloLegal,
            @Param("p_observacion") String observacion,
            @Param("p_estado") String estado
    );
}
