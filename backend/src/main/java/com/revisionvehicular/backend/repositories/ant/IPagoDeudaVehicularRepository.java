package com.revisionvehicular.backend.repositories.ant;

import com.revisionvehicular.backend.entities.ant.PagoDeudaVehicular;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;

public interface IPagoDeudaVehicularRepository extends JpaRepository<PagoDeudaVehicular, Long> {

    @Procedure(name = "sp_insertar_pago_deuda_vehicular")
    void insertar(
            @Param("p_id_deuda_vehicular") Long idDeudaVehicular,
            @Param("p_fecha_pago") java.time.LocalDateTime fechaPago,
            @Param("p_monto_original") java.math.BigDecimal montoOriginal,
            @Param("p_monto_pagado") java.math.BigDecimal montoPagado,
            @Param("p_monto_pendiente") java.math.BigDecimal montoPendiente,
            @Param("p_id_metodo_pago") Long idMetodoPago,
            @Param("p_monto_total") java.math.BigDecimal montoTotal,
            @Param("p_estado") String estado
    );

    @Procedure(name = "sp_actualizar_pago_deuda_vehicular")
    void actualizar(
            @Param("p_id_pago_deuda") Long idPagoDeuda,
            @Param("p_id_deuda_vehicular") Long idDeudaVehicular,
            @Param("p_fecha_pago") java.time.LocalDateTime fechaPago,
            @Param("p_monto_original") java.math.BigDecimal montoOriginal,
            @Param("p_monto_pagado") java.math.BigDecimal montoPagado,
            @Param("p_monto_pendiente") java.math.BigDecimal montoPendiente,
            @Param("p_id_metodo_pago") Long idMetodoPago,
            @Param("p_monto_total") java.math.BigDecimal montoTotal,
            @Param("p_estado") String estado
    );
}
