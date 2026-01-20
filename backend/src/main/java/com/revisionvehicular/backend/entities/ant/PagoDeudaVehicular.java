package com.revisionvehicular.backend.entities.ant;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "ant_pago_deuda_vehicular")
@Data
public class PagoDeudaVehicular {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pago_deuda")
    private Long idPagoDeuda;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_deuda_vehicular", nullable = false)
    private DeudaVehicular deudaVehicular;

    @Column(name = "fecha_pago", nullable = false)
    private LocalDateTime fechaPago;

    @Column(name = "monto_original", precision = 10, scale = 2, nullable = false)
    private BigDecimal montoOriginal;

    @Column(name = "monto_pagado", precision = 10, scale = 2, nullable = false)
    private BigDecimal montoPagado;

    @Column(name = "monto_pendiente", precision = 10, scale = 2, nullable = false)
    private BigDecimal montoPendiente;

    @Column(name = "metodo_pagado", precision = 10, scale = 2, nullable = false)
    private String metodoPago;

    @Column(name = "monto_total", precision = 10, scale = 2, nullable = false)
    private BigDecimal montoTotal;

    @Column(name = "estado", length = 20, nullable = false)
    private String estado;

}
