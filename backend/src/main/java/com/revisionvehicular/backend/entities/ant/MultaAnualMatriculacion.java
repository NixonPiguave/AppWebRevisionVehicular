package com.revisionvehicular.backend.entities.ant;

import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.pv.Propietario;
import com.revisionvehicular.backend.entities.sri.RegistroVehiculo;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "ant_multa_anual_matriculacion")
@Data
public class MultaAnualMatriculacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_multa_anual")
    private Long idMultaAnual;

    @ManyToOne
    @JoinColumn(name = "vehiculo_id", nullable = false)
    private Vehiculo vehiculo;

    @ManyToOne
    @JoinColumn(name = "propietario_id", nullable = false)
    private Propietario propietario;

    @ManyToOne
    @JoinColumn(name = "id_sri_registro", nullable = false)
    private RegistroVehiculo sriRegistroVehiculo;

    @Column(name = "periodo_no_matriculado", nullable = false)
    private Integer periodoNoMatriculado;

    @Column(name = "anios_acumulados", nullable = false)
    private Integer aniosAcumulados;

    @Column(name = "monto_base", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoBase;

    @Column(name = "monto_recargo", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoRecargo;

    @Column(name = "monto_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoTotal;

    @Column(name = "fecha_generacion", nullable = false)
    private LocalDate fechaGeneracion;

    @Column(name = "fecha_vencimiento")
    private LocalDate fechaVencimiento;

    @Column(name = "fecha_pago")
    private LocalDate fechaPago;

    @Column(name = "numero_comprobante_sri", length = 50)
    private String numeroComprobanteSri;

    /** SI / NO */
    @Column(name = "exonerada", nullable = false, length = 255)
    private String exonerada;

    @ManyToOne
    @JoinColumn(name = "id_exoneracion_cal")
    private ExoneracionMultaCal exoneracion;

    /** PENDIENTE / PAGADO / EXONERADO / VENCIDO */
    @Column(name = "estado", nullable = false, length = 20)
    private String estado;
}
