package com.revisionvehicular.backend.entities.ant;

import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.pv.Propietario;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "ant_multa_calendarizacion")
@Data
public class MultaCalendarizacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_multa_cal")
    private Long idMultaCal;

    @ManyToOne
    @JoinColumn(name = "vehiculo_id", nullable = false)
    private Vehiculo vehiculo;

    @ManyToOne
    @JoinColumn(name = "propietario_id", nullable = false)
    private Propietario propietario;

    @ManyToOne
    @JoinColumn(name = "id_calendarizacion", nullable = false)
    private CalendarizacionMatriculacion calendarizacion;

    @ManyToOne
    @JoinColumn(name = "id_entidad", nullable = false)
    private EntidadesTransito entidadTransito;

    @Column(name = "periodo", nullable = false)
    private Integer periodo;

    /** Mes asignado en que DEBÍA matricular (1-12) */
    @Column(name = "mes_obligatorio", nullable = false)
    private Integer mesObligatorio;

    /** Mes en que finalmente matriculó */
    @Column(name = "mes_realizado")
    private Integer mesRealizado;

    @Column(name = "monto_multa", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoMulta;

    @Column(name = "fecha_generacion", nullable = false)
    private LocalDate fechaGeneracion;

    @Column(name = "fecha_vencimiento")
    private LocalDate fechaVencimiento;

    @Column(name = "fecha_pago")
    private LocalDate fechaPago;

    @Column(name = "numero_comprobante", length = 50)
    private String numeroComprobante;

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
