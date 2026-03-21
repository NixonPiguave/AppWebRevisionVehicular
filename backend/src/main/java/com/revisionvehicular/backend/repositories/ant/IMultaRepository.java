package com.revisionvehicular.backend.repositories.ant;

import com.revisionvehicular.backend.entities.ant.Multa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface IMultaRepository extends JpaRepository<Multa, Long> {

    interface ResumenMultaRtvRow {
        Long getVehiculoId();
        Long getPropietarioId();
        BigDecimal getRecargoAcumulado();
    }

    @Query("SELECT m.vehiculo.vehiculoid AS vehiculoId, m.propietario.idPropietario AS propietarioId, "
            + "SUM(m.monto) AS recargoAcumulado FROM Multa m WHERE m.vehiculo IS NOT NULL "
            + "AND LOWER(m.motivo) LIKE LOWER(CONCAT('%', :p1, '%')) "
            + "AND LOWER(m.motivo) LIKE LOWER(CONCAT('%', :p2, '%')) "
            + "GROUP BY m.vehiculo.vehiculoid, m.propietario.idPropietario")
    List<ResumenMultaRtvRow> resumenMultasRtvAnual(@Param("p1") String parteRevisionTecnica,
                                                   @Param("p2") String parteAnual);

    @Query("SELECT m FROM Multa m LEFT JOIN FETCH m.estadoMulta LEFT JOIN FETCH m.entidadTransito "
            + "WHERE m.vehiculo.vehiculoid = :vid AND LOWER(m.motivo) LIKE LOWER(CONCAT('%', :p1, '%')) "
            + "AND LOWER(m.motivo) LIKE LOWER(CONCAT('%', :p2, '%')) "
            + "ORDER BY m.fechaEmision DESC")
    List<Multa> findDetalleRtvAnualPorVehiculo(@Param("vid") Long vehiculoId,
                                               @Param("p1") String parteRevisionTecnica,
                                               @Param("p2") String parteAnual);

    @Procedure(name = "sp_insertar_multa")
    void insertar(
            @Param("p_id_entidad") Long idEntidad,
            @Param("p_id_propietario") Long idPropietario,
            @Param("p_id_vehiculo") Long idVehiculo,
            @Param("p_id_estado_multa") Long idEstadoMulta,
            @Param("p_numero_citacion") String numeroCitacion,
            @Param("p_fecha_emision") java.time.LocalDateTime fechaEmision,
            @Param("p_fecha_notificacion") java.time.LocalDateTime fechaNotificacion,
            @Param("p_pais") String pais,
            @Param("p_ciudad") String ciudad,
            @Param("p_puntos") String puntos,
            @Param("p_motivo") String motivo,
            @Param("p_monto") java.math.BigDecimal monto,
            @Param("p_estado") String estado
    );

    @Procedure(name = "sp_actualizar_multa")
    void actualizar(
            @Param("p_id_multa") Long idMulta,
            @Param("p_id_entidad") Long idEntidad,
            @Param("p_id_propietario") Long idPropietario,
            @Param("p_id_vehiculo") Long idVehiculo,
            @Param("p_id_estado_multa") Long idEstadoMulta,
            @Param("p_numero_citacion") String numeroCitacion,
            @Param("p_fecha_emision") java.time.LocalDateTime fechaEmision,
            @Param("p_fecha_notificacion") java.time.LocalDateTime fechaNotificacion,
            @Param("p_pais") String pais,
            @Param("p_ciudad") String ciudad,
            @Param("p_puntos") String puntos,
            @Param("p_motivo") String motivo,
            @Param("p_monto") java.math.BigDecimal monto,
            @Param("p_estado") String estado
    );
}
