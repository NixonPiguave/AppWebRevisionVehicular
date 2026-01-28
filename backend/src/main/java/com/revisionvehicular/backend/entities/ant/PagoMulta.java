package com.revisionvehicular.backend.entities.ant;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "ant_pago_multa")
@Data
public class PagoMulta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pago_multa")
    private Long idPagoMulta;

    @ManyToOne
    @JoinColumn(name = "id_multa", nullable = false)
    private Multa multa;

    @Column(name = "fecha_pago", nullable = false)
    private LocalDate fechaPago;

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
