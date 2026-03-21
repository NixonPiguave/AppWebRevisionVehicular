package com.revisionvehicular.backend.repositories.rtv;

import com.revisionvehicular.backend.entities.rtv.Inspeccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface IInspeccionRepository extends JpaRepository<Inspeccion, Long> {

    @Query("SELECT DISTINCT i FROM Inspeccion i " +
            "LEFT JOIN FETCH i.usuario " +
            "LEFT JOIN FETCH i.vehiculo v " +
            "LEFT JOIN FETCH v.modeloVehiculo mv " +
            "LEFT JOIN FETCH mv.marca " +
            "LEFT JOIN FETCH i.linea " +
            "LEFT JOIN FETCH i.detalles d " +
            "LEFT JOIN FETCH d.metodoInspeccion " +
            "LEFT JOIN FETCH d.defecto dd " +
            "LEFT JOIN FETCH dd.tipoDefecto " +
            "WHERE i.vehiculo.vehiculoid = :vehiculoId AND i.fechaInspeccion BETWEEN :desde AND :hasta ORDER BY i.fechaInspeccion")
    List<Inspeccion> findByVehiculoIdAndRangoFechas(@Param("vehiculoId") Long vehiculoId, @Param("desde") LocalDateTime desde, @Param("hasta") LocalDateTime hasta);

    @Query(
            value = "SELECT * FROM rtv_inspeccion WHERE vehiculo_id = :vehiculoId ORDER BY inspeccion_id DESC LIMIT 1",
            nativeQuery = true
    )
    Inspeccion findUltimaPorVehiculo(@Param("vehiculoId") Long vehiculoId);

    @Procedure(procedureName = "sp_insertar_inspeccion")
    void insertarInspeccion(
            @Param("p_fecha_inspeccion") LocalDateTime fechaInspeccion,
            @Param("p_resultado") String resultado,
            @Param("p_observaciones") String observaciones,
            @Param("p_vehiculo_id") Long vehiculoId,
            @Param("p_linea_id") Long lineaId,
            @Param("p_usuario_id") Long usuarioId,
            @Param("p_estado") String estado
    );

    @Procedure(procedureName = "sp_actualizar_inspeccion")
    void actualizarInspeccion(
            @Param("p_inspeccion_id") Long inspeccionId,
            @Param("p_fecha_inspeccion") LocalDateTime fechaInspeccion,
            @Param("p_resultado") String resultado,
            @Param("p_observaciones") String observaciones,
            @Param("p_vehiculo_id") Long vehiculoId,
            @Param("p_metodo_inspeccion_id") Long metodoInspeccionId,
            @Param("p_linea_id") Long lineaId,
            @Param("p_usuario_id") Long usuarioId,
            @Param("p_estado") String estado,
            @Param("p_id_calendarizacion") Long idCalendarizacion
    );

    @Modifying
    @Query(value = "UPDATE rtv_inspeccion SET resultado = :resultado WHERE inspeccion_id = :inspeccionId", nativeQuery = true)
    void actualizarResultado(@Param("inspeccionId") Long inspeccionId, @Param("resultado") String resultado);

    @Modifying
    @Query(value = "UPDATE rtv_inspeccion SET valores_medidos = :json WHERE inspeccion_id = :inspeccionId", nativeQuery = true)
    void actualizarValoresMedidos(@Param("inspeccionId") Long inspeccionId, @Param("json") String json);
}