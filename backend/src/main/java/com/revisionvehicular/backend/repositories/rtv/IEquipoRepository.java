package com.revisionvehicular.backend.repositories.rtv;

import com.revisionvehicular.backend.entities.cv.Categoria;
import com.revisionvehicular.backend.entities.rtv.Equipos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface IEquipoRepository extends JpaRepository<Equipos, Long> {
    @Procedure(procedureName = "sp_rtv_equipos_insertar")
    void spInsertarEquipo(
            @Param("p_influencia") Integer pInfluencia,
            @Param("p_fecha_ultima_calibracion") LocalDateTime pFechaUltimaCalibracion,
            @Param("p_fecha_ultimo_mantenimiento") LocalDateTime pFechaUltimoMantenimiento,
            @Param("p_estado") String pEstado,
            @Param("p_codigo_interno") String pCodigoInterno,
            @Param("p_equipo") String pEquipo,
            @Param("p_modelo") String pModelo,
            @Param("p_serial_equipo") String pSerialEquipo
    );

    @Procedure(procedureName = "sp_rtv_equipos_actualizar")
    void spActualizarEquipo(
            @Param("p_equipo_id") Long pEquipoId,
            @Param("p_influencia") Integer pInfluencia,
            @Param("p_fecha_ultima_calibracion") LocalDateTime pFechaUltimaCalibracion,
            @Param("p_fecha_ultimo_mantenimiento") LocalDateTime pFechaUltimoMantenimiento,
            @Param("p_estado") String pEstado,
            @Param("p_codigo_interno") String pCodigoInterno,
            @Param("p_equipo") String pEquipo,
            @Param("p_modelo") String pModelo,
            @Param("p_serial_equipo") String pSerialEquipo
    );
    Optional<Equipos> getByEquipo(String equipo);
    Optional<Equipos> findById(Long id);

}
