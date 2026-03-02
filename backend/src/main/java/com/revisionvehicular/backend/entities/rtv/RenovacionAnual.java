package com.revisionvehicular.backend.entities.rtv;

import com.revisionvehicular.backend.entities.ant.CalendarizacionMatriculacion;
import com.revisionvehicular.backend.entities.ant.EntidadesTransito;
import com.revisionvehicular.backend.entities.ant.ExoneracionMultaCal;
import com.revisionvehicular.backend.entities.ant.MultaAnualMatriculacion;
import com.revisionvehicular.backend.entities.ant.MultaCalendarizacion;
import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.pv.Propietario;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Servicio 02 — Renovación Anual de Matrícula
 * Base legal: Art.4 · Art.12 · Art.13 · Art.14 · Art.15 · Art.16(2) · Art.26 · Art.83
 */
@Entity
@Table(name = "rtv_renovacion_anual")
@Data
public class RenovacionAnual {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_renovacion")
    private Long idRenovacion;

    // ── Referencias a entidades existentes ───────────────────────────────────

    @ManyToOne
    @JoinColumn(name = "id_tramite", nullable = false)
    private TramiteMatriculacion tramite;

    @ManyToOne
    @JoinColumn(name = "vehiculo_id", nullable = false)
    private Vehiculo vehiculo;

    @ManyToOne
    @JoinColumn(name = "propietario_id", nullable = false)
    private Propietario propietario;

    @ManyToOne
    @JoinColumn(name = "id_entidad", nullable = false)
    private EntidadesTransito entidad;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    /** → rtv_inspeccion. Inspección anual. Art.4(3). */
    @ManyToOne
    @JoinColumn(name = "inspeccion_id")
    private Inspeccion inspeccion;

    /** → ant_calendarizacion_matriculacion. Mes obligatorio según último dígito de placa. Art.12. */
    @ManyToOne
    @JoinColumn(name = "id_calendarizacion", nullable = false)
    private CalendarizacionMatriculacion calendarizacion;

    // ── Calendarización y retraso (Art.12-13) ─────────────────────────────────

    @Column(name = "numero_tramite", nullable = false, unique = true, length = 30)
    private String numeroTramite;

    /** Año de renovación. Ej: 2025. */
    @Column(name = "periodo", nullable = false)
    private Integer periodo;

    /** Mes en que debía matricular (1-12). Determinado por último dígito placa. Art.12. */
    @Column(name = "mes_obligatorio", nullable = false)
    private Integer mesObligatorio;

    /** Último día del mes obligatorio asignado. Art.12. */
    @Column(name = "fecha_limite_calendarizacion", nullable = false)
    private LocalDate fechaLimiteCalendarizacion;

    /** SI / NO. Llegó fuera de su mes asignado. Art.13. */
    @Column(name = "llego_con_retraso", nullable = false, length = 3)
    private String llegoConRetraso;

    /** Días de retraso respecto al mes obligatorio. Art.13. */
    @Column(name = "dias_retraso")
    private Integer diasRetraso;

    // ── Multas y exoneraciones ────────────────────────────────────────────────

    /** → ant_multa_calendarizacion. Multa por retraso cobrada por el GAD. Art.13. */
    @ManyToOne
    @JoinColumn(name = "multa_calendarizacion_id")
    private MultaCalendarizacion multaCalendarizacion;

    /** → ant_multa_anual_matriculacion. Multa por años anteriores sin matricular. Art.13/15. */
    @ManyToOne
    @JoinColumn(name = "multa_anual_id")
    private MultaAnualMatriculacion multaAnual;

    /** → ant_exoneracion_multa_cal. Exoneración aprobada si aplica. Art.14. */
    @ManyToOne
    @JoinColumn(name = "exoneracion_multa_id")
    private ExoneracionMultaCal exoneracionMulta;

    /** TALLER_MECANICO / ROBO_VEHICULO / PROCESO_JUDICIAL /
     *  SECTOR_PUBLICO / PROBLEMA_ENTIDAD / FUERZA_MAYOR. Art.14. */
    @Column(name = "causal_exoneracion", length = 50)
    private String causalExoneracion;

    // ── Validaciones (Art.26 = mismo criterio Art.18) ─────────────────────────

    /** SI / NO. BUND vigente. Art.83. */
    @Column(name = "validado_bund", nullable = false, length = 3)
    private String validadoBund;

    /** SI / NO. Impuestos SRI pagados. Art.26(2). */
    @Column(name = "validado_sri", nullable = false, length = 3)
    private String validadoSri;

    /** SI / NO. Sin multas pendientes. Art.26(3). */
    @Column(name = "validado_multas", nullable = false, length = 3)
    private String validadoMultas;

    /** SI / NO. Sin convenios vencidos. Art.26(5). */
    @Column(name = "validado_convenios", nullable = false, length = 3)
    private String validadoConvenios;

    /** SI / NO. Sin bloqueos activos. Art.26(5). */
    @Column(name = "validado_bloqueos", nullable = false, length = 3)
    private String validadoBloqueos;

    // ── Montos y estado ───────────────────────────────────────────────────────

    /** Suma: tasa GAD + multa calendarización + multa anual SRI. */
    @Column(name = "monto_total_cobrado", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoTotalCobrado;

    /** SOLICITUD / PAGO / RTV / EMISION / CONCLUIDO / ANULADO. */
    @Column(name = "etapa_actual", nullable = false, length = 20)
    private String etapaActual;

    /** INICIADO / EN_PROCESO / CONCLUIDO / ANULADO. */
    @Column(name = "estado", nullable = false, length = 20)
    private String estado;

    @Column(name = "fecha_solicitud", nullable = false)
    private LocalDateTime fechaSolicitud;

    @Column(name = "fecha_conclusion")
    private LocalDateTime fechaConclusion;
}