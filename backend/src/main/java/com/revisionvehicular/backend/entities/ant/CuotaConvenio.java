package com.revisionvehicular.backend.entities.ant;

import com.revisionvehicular.backend.entities.srtv.MetodosPago;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "ant_cuota_convenio")
@Data
public class CuotaConvenio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cuota")
    private Long idCuota;

    @ManyToOne
    @JoinColumn(name = "id_convenio", nullable = false)
    private ConvenioPago convenioPago;

    @Column(name = "numero_cuota", nullable = false)
    private Integer numeroCuota;

    @Column(name = "monto_cuota", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoCuota;

    @Column(name = "fecha_vencimiento", nullable = false)
    private LocalDate fechaVencimiento;

    @Column(name = "fecha_pago")
    private LocalDate fechaPago;

    @Column(name = "monto_pagado", precision = 10, scale = 2)
    private BigDecimal montoPagado;

    @ManyToOne
    @JoinColumn(name = "id_metodo_pago")
    private MetodosPago metodoPago;

    @Column(name = "numero_comprobante", length = 50)
    private String numeroComprobante;

    @Column(name = "dias_retraso")
    private Integer diasRetraso;

    @Column(name = "recargo_mora", precision = 10, scale = 2)
    private BigDecimal recargoMora;

    /** PENDIENTE / PAGADA / VENCIDA / ANULADA */
    @Column(name = "estado", nullable = false, length = 20)
    private String estado;
}
