package com.revisionvehicular.backend.repositories.rtv;

import com.revisionvehicular.backend.entities.rtv.DetalleInspeccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface IDetalleInspeccionRepository extends JpaRepository<DetalleInspeccion, Long> {

    @Procedure(name = "sp_insertar_detalle_inspeccion")
    void insertarDetalleInspeccion(
            @Param("p_inspeccion_id") Long inspeccionId,
            @Param("p_defecto_id") Long defectoId,
            @Param("p_observacion") String observacion,
            @Param("p_estado") String estado,
            @Param("p_umbral_id") Long umbralId,
            @Param("p_metodo_inspeccion_id") Long metodoInspeccionId
    );

    @Procedure(name = "sp_actualizar_detalle_inspeccion")
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