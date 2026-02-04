package com.revisionvehicular.backend.repositories.rtv;

import com.revisionvehicular.backend.entities.rtv.PagoInspeccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface IPagoInspeccionRepository extends JpaRepository<PagoInspeccion, Long> {

    @Procedure(name = "sp_insertar_pago_inspeccion")
    void insertarPagoInspeccion(
            @Param("p_valor") String valor,
            @Param("p_fecha_pago") LocalDateTime fechaPago,
            @Param("p_estado") String estado,
            @Param("p_tarifa_id") Long tarifaId,
            @Param("p_inspeccion_id") Long inspeccionId,
            @Param("p_id_propietario") Long idPropietario
    );

    @Procedure(name = "sp_actualizar_pago_inspeccion")
    void actualizarPagoInspeccion(
            @Param("p_id_pago") Long idPago,
            @Param("p_valor") String valor,
            @Param("p_fecha_pago") LocalDateTime fechaPago,
            @Param("p_estado") String estado,
            @Param("p_tarifa_id") Long tarifaId,
            @Param("p_inspeccion_id") Long inspeccionId,
            @Param("p_id_propietario") Long idPropietario
    );
}