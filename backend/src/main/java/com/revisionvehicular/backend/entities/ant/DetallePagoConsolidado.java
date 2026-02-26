package com.revisionvehicular.backend.entities.ant;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

@Entity
@Table(name = "ant_detalle_pago_consolidado")
@Data
public class DetallePagoConsolidado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle")
    private Long idDetalle;

    @ManyToOne
    @JoinColumn(name = "id_pago_consolidado", nullable = false)
    private PagoConsolidadoTramite pagoConsolidado;

    /**
     * Tipo de deuda que cubre este detalle:
     * MULTA_INFRACCION      → id referencia a ant_multa
     * MULTA_CALENDARIZACION → id referencia a ant_multa_calendarizacion
     * MULTA_ANUAL           → id referencia a ant_multa_anual_matriculacion
     * DEUDA_VEHICULAR       → id referencia a ant_deuda_vehicular
     * CUOTA_CONVENIO        → id referencia a ant_cuota_convenio
     */
    @Column(name = "tipo_deuda", nullable = false, length = 50)
    private String tipoDeuda;

    /** ID del registro referenciado según tipo_deuda */
    @Column(name = "id_referencia", nullable = false)
    private Long idReferencia;

    @Column(name = "monto_pagado", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoPagado;

    @Column(name = "estado", nullable = false, length = 20)
    private String estado;
}
