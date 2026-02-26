package com.revisionvehicular.backend.entities.ant;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

@Entity
@Table(name = "ant_convenio_pago_multa")
@Data
public class ConvenioPagoMulta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_convenio_multa")
    private Long idConvenioMulta;

    @ManyToOne
    @JoinColumn(name = "id_convenio", nullable = false)
    private ConvenioPago convenioPago;

    @ManyToOne
    @JoinColumn(name = "id_multa", nullable = false)
    private Multa multa;

    @Column(name = "monto_incluido", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoIncluido;

    @Column(name = "estado", nullable = false, length = 20)
    private String estado;
}
