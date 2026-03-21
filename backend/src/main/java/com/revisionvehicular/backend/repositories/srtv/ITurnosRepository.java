package com.revisionvehicular.backend.repositories.srtv;

import com.revisionvehicular.backend.entities.srtv.Turnos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ITurnosRepository extends JpaRepository<Turnos, Long> {

    List<Turnos> findByEstadoOrderByFechaInicioDesc(String estado);

    List<Turnos> findByEstadoAndServicio_IdTipoTramiteOrderByFechaInicioDesc(String estado, Long idTipoTramite);

    List<Turnos> findByServicio_IdTipoTramiteOrderByFechaInicioDesc(Long idTipoTramite);

    List<Turnos> findByEstadoInOrderByFechaInicioDesc(List<String> estados);

    List<Turnos> findByEstadoInAndServicio_IdTipoTramiteOrderByFechaInicioDesc(List<String> estados, Long idTipoTramite);

    @Query("SELECT t FROM Turnos t LEFT JOIN FETCH t.vehiculo v LEFT JOIN FETCH v.subcategoria s LEFT JOIN FETCH s.categoria c WHERE t.estado IN :estados ORDER BY t.fechaInicio DESC")
    List<Turnos> findTurnosPagadosWithVehiculoCategoria(@Param("estados") List<String> estados);

    @Query("SELECT t FROM Turnos t LEFT JOIN FETCH t.vehiculo v LEFT JOIN FETCH v.subcategoria s LEFT JOIN FETCH s.categoria c WHERE t.estado IN :estados AND t.servicio.idTipoTramite = :servicioId ORDER BY t.fechaInicio DESC")
    List<Turnos> findTurnosPagadosWithVehiculoCategoriaPorServicio(@Param("estados") List<String> estados, @Param("servicioId") Long servicioId);

    // Último turno insertado (mayor ID)
    Turnos findTopByOrderByTurnoIdDesc();

    @Procedure(procedureName = "sp_insertar_turno")
    void insertarTurno(
            @Param("p_propietario_id") Long propietarioId,
            @Param("p_vehiculo_id") Long vehiculoId,
            @Param("p_id_tipo_tramite") Long idTipoTramite,
            @Param("p_id_tramite") Long idTramite,
            @Param("p_fecha_inicio") LocalDate fechaInicio,
            @Param("p_fecha_fin") LocalDate fechaFin,
            @Param("p_fecha_cancelado") LocalDate fechaCancelado,
            @Param("p_estado") String estado
    );

    @Procedure(procedureName = "sp_actualizar_turno")
    void actualizarTurno(
            @Param("p_turno_id") Long turnoId,
            @Param("p_propietario_id") Long propietarioId,
            @Param("p_vehiculo_id") Long vehiculoId,
            @Param("p_id_tipo_tramite") Long idTipoTramite,
            @Param("p_id_tramite") Long idTramite,
            @Param("p_fecha_inicio") LocalDate fechaInicio,
            @Param("p_fecha_fin") LocalDate fechaFin,
            @Param("p_fecha_cancelado") LocalDate fechaCancelado,
            @Param("p_estado") String estado
    );

    @Procedure(procedureName = "sp_actualizar_monto_pagado")
    void actualizarMontoPagado(
            @Param("p_turno_id") Long turnoId,
            @Param("p_monto_pagado") BigDecimal montoPagado
    );

    @Modifying
    @Query(value = "UPDATE rtv_turnos " +
            "SET estado = :estado, " +
            "    fecha_cancelado = CASE " +
            "      WHEN UPPER(:estado) = 'CANCELADO' THEN :fechaCancelado " +
            "      ELSE fecha_cancelado " +
            "    END " +
            ",  validador = fn_generar_validador_turno(" +
            "        turno_id, " +
            "        propietario_id, " +
            "        vehiculo_id, " +
            "        id_tipo_tramite, " +
            "        id_tramite, " +
            "        fecha_inicio, " +
            "        fecha_fin, " +
            "        CASE " +
            "          WHEN UPPER(:estado) = 'CANCELADO' THEN :fechaCancelado " +
            "          ELSE fecha_cancelado " +
            "        END, " +
            "        :estado, " +
            "        monto_pagado" +
            "    ) " +
            "WHERE turno_id = :turnoId", nativeQuery = true)
    int actualizarEstado(
            @Param("turnoId") Long turnoId,
            @Param("estado") String estado,
            @Param("fechaCancelado") LocalDate fechaCancelado
    );

    @Modifying
    @Query(value = "UPDATE rtv_turnos SET vehiculo_id = :vehiculoId WHERE turno_id = :turnoId", nativeQuery = true)
    int asignarVehiculo(@Param("turnoId") Long turnoId, @Param("vehiculoId") Long vehiculoId);

    @Query("SELECT t FROM Turnos t LEFT JOIN FETCH t.vehiculo v LEFT JOIN FETCH v.modeloVehiculo mv LEFT JOIN FETCH mv.marca WHERE t.turnoId = :turnoId")
    java.util.Optional<Turnos> findByIdWithVehiculoCompleto(@Param("turnoId") Long turnoId);

    @Query("SELECT t FROM Turnos t LEFT JOIN FETCH t.servicio s LEFT JOIN FETCH t.vehiculo v "
            + "LEFT JOIN FETCH v.subcategoria sub LEFT JOIN FETCH sub.categoria cat WHERE t.turnoId = :turnoId")
    java.util.Optional<Turnos> findByIdWithServicioYVehiculoCategoria(@Param("turnoId") Long turnoId);
}