package com.revisionvehicular.backend.repositories.rtv;

import com.revisionvehicular.backend.entities.rtv.Inspeccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface IInspeccionRepository extends JpaRepository<Inspeccion, Long> {

    @Query("SELECT DISTINCT i FROM Inspeccion i LEFT JOIN FETCH i.usuario u LEFT JOIN FETCH i.detalles d LEFT JOIN FETCH d.metodoInspeccion WHERE i.vehiculo.vehiculoid = :vehiculoId AND i.fechaInspeccion BETWEEN :desde AND :hasta ORDER BY i.fechaInspeccion")
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
}