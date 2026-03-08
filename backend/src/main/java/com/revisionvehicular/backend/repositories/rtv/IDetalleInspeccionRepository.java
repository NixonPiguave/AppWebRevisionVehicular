package com.revisionvehicular.backend.repositories.rtv;

import com.revisionvehicular.backend.entities.rtv.DetalleInspeccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IDetalleInspeccionRepository extends JpaRepository<DetalleInspeccion, Long> {

    @Query(value = "SELECT DISTINCT di.metodo_inspeccion_id FROM rtv_detalle_inspeccion di " +
            "JOIN rtv_inspeccion i ON di.inspeccion_id = i.inspeccion_id " +
            "WHERE i.vehiculo_id = :vehiculoId", nativeQuery = true)
    List<Long> findMetodoIdsRealizadosPorVehiculo(@Param("vehiculoId") Long vehiculoId);

    @Procedure(procedureName = "sp_insertar_detalle_inspeccion")
    void insertarDetalleInspeccion(
            @Param("p_inspeccion_id") Long inspeccionId,
            @Param("p_defecto_id") Long defectoId,
            @Param("p_observacion") String observacion,
            @Param("p_estado") String estado,
            @Param("p_umbral_id") Long umbralId,
            @Param("p_metodo_inspeccion_id") Long metodoInspeccionId
    );

    @Procedure(procedureName = "sp_actualizar_detalle_inspeccion")
    void actualizarDetalleInspeccion(
            @Param("p_detalle_inspeccion_id") Long detalleInspeccionId,
            @Param("p_inspeccion_id") Long inspeccionId,
            @Param("p_defecto_id") Long defectoId,
            @Param("p_observacion") String observacion,
            @Param("p_estado") String estado,
            @Param("p_umbral_id") Long umbralId,
            @Param("p_metodo_inspeccion_id") Long metodoInspeccionId
    );
}