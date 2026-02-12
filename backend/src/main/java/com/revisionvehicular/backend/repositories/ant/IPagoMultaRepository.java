package com.revisionvehicular.backend.repositories.ant;

import com.revisionvehicular.backend.entities.ant.PagoMulta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface IPagoMultaRepository extends JpaRepository<PagoMulta, Long> {

    @Procedure(procedureName = "sp_pago_multa_insertar")
    void spInsertarPagoMulta(
            @Param("p_id_multa") Long idMulta,
            @Param("p_fecha_pago") java.time.LocalDate fechaPago,
            @Param("p_monto_original") java.math.BigDecimal montoOriginal,
            @Param("p_monto_pagado") java.math.BigDecimal montoPagado,
            @Param("p_monto_pendiente") java.math.BigDecimal montoPendiente,
            @Param("p_id_metodo_pago") Long idMetodoPago,
            @Param("p_monto_total") java.math.BigDecimal montoTotal,
            @Param("p_estado") String estado
    );

    @Procedure(procedureName = "sp_pago_multa_actualizar")
    void spActualizarPagoMulta(
            @Param("p_id_pago_multa") Long idPagoMulta,
            @Param("p_id_multa") Long idMulta,
            @Param("p_fecha_pago") java.time.LocalDate fechaPago,
            @Param("p_monto_original") java.math.BigDecimal montoOriginal,
            @Param("p_monto_pagado") java.math.BigDecimal montoPagado,
            @Param("p_monto_pendiente") java.math.BigDecimal montoPendiente,
            @Param("p_id_metodo_pago") Long idMetodoPago,
            @Param("p_monto_total") java.math.BigDecimal montoTotal,
            @Param("p_estado") String estado
    );
}
