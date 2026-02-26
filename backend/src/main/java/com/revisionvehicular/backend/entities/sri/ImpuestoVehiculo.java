package com.revisionvehicular.backend.entities.sri;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "sri_impuesto_vehicular")
@Data
public class ImpuestoVehiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_impuesto")
    private Long idImpuesto;

    @ManyToOne
    @JoinColumn(name = "id_sri_registro", nullable = false)
    private RegistroVehiculo sriRegistroVehiculo;

    @Column(name = "periodo", nullable = false)
    private Integer periodo;

    /** MATRICULACION / RODAJE / IVA / OTRO */
    @Column(name = "tipo_impuesto", nullable = false, length = 50)
    private String tipoImpuesto;

    @Column(name = "monto_base", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoBase;

    @Column(name = "monto_descuento", precision = 10, scale = 2)
    private BigDecimal montoDescuento;

    @Column(name = "monto_recargo", precision = 10, scale = 2)
    private BigDecimal montoRecargo;

    @Column(name = "monto_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoTotal;

    @Column(name = "fecha_emision", nullable = false)
    private LocalDate fechaEmision;

    @Column(name = "fecha_vencimiento", nullable = false)
    private LocalDate fechaVencimiento;

    @Column(name = "fecha_pago")
    private LocalDate fechaPago;

    /** PENDIENTE / PAGADO / VENCIDO / EXONERADO */
    @Column(name = "estado_pago", nullable = false, length = 20)
    private String estadoPago;

    @Column(name = "numero_comprobante", length = 50)
    private String numeroComprobante;

    @Column(name = "estado", nullable = false, length = 20)
    private String estado;
}
