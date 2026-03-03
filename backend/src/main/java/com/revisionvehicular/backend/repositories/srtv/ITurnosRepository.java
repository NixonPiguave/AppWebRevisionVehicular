package com.revisionvehicular.backend.repositories.srtv;

import com.revisionvehicular.backend.entities.srtv.Turnos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface ITurnosRepository extends JpaRepository<Turnos, Long> {

    @Procedure(name = "sp_insertar_turno")
    void insertarTurno(
            @Param("p_propietario_id") Long propietarioId,
            @Param("p_vehiculo_id") Long vehiculoId,
            @Param("p_id_tipo_tramite") Long idTipoTramite,
            @Param("p_id_tramite") Long idTramite,
            @Param("p_id_entidad") Long idEntidad,
            @Param("p_fecha_inicio") LocalDate fechaInicio,
            @Param("p_fecha_fin") LocalDate fechaFin,
            @Param("p_fecha_cancelado") LocalDate fechaCancelado,
            @Param("p_estado") String estado
    );

    @Procedure(name = "sp_actualizar_turno")
    void actualizarTurno(
            @Param("p_turno_id") Long turnoId,
            @Param("p_propietario_id") Long propietarioId,
            @Param("p_vehiculo_id") Long vehiculoId,
            @Param("p_id_tipo_tramite") Long idTipoTramite,
            @Param("p_id_tramite") Long idTramite,
            @Param("p_id_entidad") Long idEntidad,
            @Param("p_fecha_inicio") LocalDate fechaInicio,
            @Param("p_fecha_fin") LocalDate fechaFin,
            @Param("p_fecha_cancelado") LocalDate fechaCancelado,
            @Param("p_estado") String estado
    );
}