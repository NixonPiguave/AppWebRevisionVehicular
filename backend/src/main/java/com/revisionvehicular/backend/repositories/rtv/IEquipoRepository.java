package com.revisionvehicular.backend.repositories.rtv;

import com.revisionvehicular.backend.entities.rtv.Equipos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface IEquipoRepository extends JpaRepository<Equipos, Long> {

    @Procedure(procedureName = "sp_rtv_equipos_insertar")
    void spInsertarEquipo(
            @Param("p_influencia") Integer pInfluencia,
            @Param("p_fecha_ultima_calibracion") LocalDate pFechaUltimaCalibracion,
            @Param("p_fecha_ultimo_mantenimiento") LocalDate pFechaUltimoMantenimiento,
            @Param("p_estado") String pEstado,
            @Param("p_codigo_interno") String pCodigoInterno,
            @Param("p_equipo") String pEquipo,
            @Param("p_modelo") String pModelo,
            @Param("p_serial_equipo") String pSerialEquipo,
            @Param("p_linea_id") Long pLineaId
    );

    @Procedure(procedureName = "sp_rtv_equipos_actualizar")
    void spActualizarEquipo(
            @Param("p_equipo_id") Long pEquipoId,
            @Param("p_influencia") Integer pInfluencia,
            @Param("p_fecha_ultima_calibracion") LocalDate pFechaUltimaCalibracion,
            @Param("p_fecha_ultimo_mantenimiento") LocalDate pFechaUltimoMantenimiento,
            @Param("p_estado") String pEstado,
            @Param("p_codigo_interno") String pCodigoInterno,
            @Param("p_equipo") String pEquipo,
            @Param("p_modelo") String pModelo,
            @Param("p_serial_equipo") String pSerialEquipo,
            @Param("p_linea_id") Long pLineaId
    );

     // Buscar equipo por serial (único)
    Optional<Equipos> findBySerialEquipo(String serialEquipo);

     // Verificar si existe un serial
    boolean existsBySerialEquipo(String serialEquipo);

     //Verificar si existe un código interno
    boolean existsByCodigoInterno(String codigoInterno);

     // Buscar por ID
    Optional<Equipos> findById(Long id);
}