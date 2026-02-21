package com.revisionvehicular.backend.entities.ant;

import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.pv.Propietario;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "ant_convenio_pago")
@Data
public class ConvenioPago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_convenio")
    private Long idConvenio;

    @ManyToOne
    @JoinColumn(name = "propietario_id", nullable = false)
    private Propietario propietario;

    /** Puede ser nulo si el convenio aplica a la persona, no a un vehículo específico */
    @ManyToOne
    @JoinColumn(name = "vehiculo_id")
    private Vehiculo vehiculo;

    @ManyToOne
    @JoinColumn(name = "id_entidad", nullable = false)
    private EntidadesTransito entidadTransito;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "monto_total_deuda", nullable = false, precision = 12, scale = 2)
    private BigDecimal montoTotalDeuda;

    @Column(name = "monto_entrada", precision = 10, scale = 2)
    private BigDecimal montoEntrada;

    @Column(name = "monto_cuota", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoCuota;

    @Column(name = "numero_cuotas", nullable = false)
    private Integer numeroCuotas;

    @Column(name = "fecha_suscripcion", nullable = false)
    private LocalDate fechaSuscripcion;

    @Column(name = "fecha_primera_cuota", nullable = false)
    private LocalDate fechaPrimeraCuota;

    @Column(name = "fecha_ultima_cuota", nullable = false)
    private LocalDate fechaUltimaCuota;

    @Column(name = "fecha_vencimiento", nullable = false)
    private LocalDate fechaVencimiento;

    @Column(name = "cuotas_pagadas", nullable = false)
    private Integer cuotasPagadas;

    @Column(name = "cuotas_vencidas", nullable = false)
    private Integer cuotasVencidas;

    @Column(name = "monto_pagado", nullable = false, precision = 12, scale = 2)
    private BigDecimal montoPagado;

    @Column(name = "monto_pendiente", nullable = false, precision = 12, scale = 2)
    private BigDecimal montoPendiente;

    /** Link al convenio firmado */
    @Column(name = "documento_convenio", length = 255)
    private String documentoConvenio;

    /** VIGENTE / VENCIDO / CUMPLIDO / ANULADO */
    @Column(name = "estado", nullable = false, length = 20)
    private String estado;
}
