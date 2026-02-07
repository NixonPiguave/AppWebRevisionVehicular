package com.revisionvehicular.backend.repositories.rtv;

import com.revisionvehicular.backend.entities.rtv.Matricula;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;

@Repository
public interface IMatriculaRepository extends JpaRepository<Matricula, Long> {

    @Procedure(procedureName = "sp_insertar_matricula")
    void insertarMatricula(
            @Param("p_id_vehiculo") Long idVehiculo,
            @Param("p_id_inspeccion") Long idInspeccion,
            @Param("p_periodo") Integer periodo,
            @Param("p_fecha_emision") LocalDate fechaEmision,
            @Param("p_fecha_caducidad") LocalDate fechaCaducidad,
            @Param("p_valor_total") BigDecimal valorTotal,
            @Param("p_estado") String estado,
            @Param("p_id_excepcion") Long idExcepcion
    );

    @Procedure(procedureName = "sp_actualizar_matricula")
    void actualizarMatricula(
            @Param("p_id_matricula") Long idMatricula,
            @Param("p_id_vehiculo") Long idVehiculo,
            @Param("p_id_inspeccion") Long idInspeccion,
            @Param("p_periodo") Integer periodo,
            @Param("p_fecha_emision") LocalDate fechaEmision,
            @Param("p_fecha_caducidad") LocalDate fechaCaducidad,
            @Param("p_valor_total") BigDecimal valorTotal,
            @Param("p_estado") String estado,
            @Param("p_id_excepcion") Long idExcepcion
    );
}