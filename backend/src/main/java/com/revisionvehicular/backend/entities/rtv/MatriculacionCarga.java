package com.revisionvehicular.backend.entities.rtv;

import com.revisionvehicular.backend.entities.ant.CalendarizacionMatriculacion;
import com.revisionvehicular.backend.entities.ant.EntidadesTransito;
import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.pv.Propietario;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Servicio 07 — Matriculación de Unidades de Carga
 * Base legal: Art.4 · Art.16(7) · Art.40 · Art.41 · Art.42 · Art.18
 *
 * Requiere certificado de pesos/dimensiones (Art.41) y homologación
 * para carga (Art.22/40). Si supera dimensiones máximas exige
 * permiso MTOP (Art.42). Aplica todas las validaciones Art.18.
 */
@Entity
@Table(name = "rtv_matriculacion_carga")
@Data
public class MatriculacionCarga {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_matriculacion_carga")
    private Long idMatriculacionCarga;

    // ── Referencias a entidades existentes ───────────────────────────────────

    @ManyToOne
    @JoinColumn(name = "id_tramite", nullable = false)
    private TramiteMatriculacion tramite;

    /** → cv_vehiculo (tipo_vehiculo = CARGA). Art.40. */
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

    /** → rtv_inspeccion. RTV con parámetros para carga pesada. Art.4(3). */
    @ManyToOne
    @JoinColumn(name = "inspeccion_id", nullable = false)
    private Inspeccion inspeccion;

    /** → ant_calendarizacion_matriculacion. Art.12. */
    @ManyToOne
    @JoinColumn(name = "id_calendarizacion", nullable = false)
    private CalendarizacionMatriculacion calendarizacion;

    // ── Datos de carga (Art.40-42) ────────────────────────────────────────────

    @Column(name = "numero_tramite", nullable = false, unique = true, length = 30)
    private String numeroTramite;

    /** PRIMERA_VEZ / RENOVACION. Art.40. */
    @Column(name = "tipo_matriculacion", nullable = false, length = 20)
    private String tipoMatriculacion;

    /** Capacidad de carga en toneladas métricas. Art.41. */
    @Column(name = "tonelaje", nullable = false, precision = 8, scale = 2)
    private BigDecimal tonelaje;

    /** Link al certificado de pesos y dimensiones. Art.41. */
    @Column(name = "cert_pesos_dimensiones", nullable = false, length = 255)
    private String certPesosDimensiones;

    /** SI / NO. Obligatorio si supera dimensiones máximas. Art.42. */
    @Column(name = "requiere_permiso_mtop", nullable = false, length = 3)
    private String requierePermisoMtop;

    /** Link al permiso MTOP cuando aplica. Art.42. */
    @Column(name = "permiso_mtop", length = 255)
    private String permisoMtop;

    /** Link al certificado de homologación para uso de carga. Art.22/40. */
    @Column(name = "cert_homologacion_carga", nullable = false, length = 255)
    private String certHomologacionCarga;

    // ── Validaciones (Art.18) ─────────────────────────────────────────────────

    /** SI / NO. Art.83. */
    @Column(name = "validado_bund", nullable = false, length = 3)
    private String validadoBund;

    /** SI / NO. Art.18(1). */
    @Column(name = "validado_sri", nullable = false, length = 3)
    private String validadoSri;

    /** SI / NO. Art.18(3). */
    @Column(name = "validado_multas", nullable = false, length = 3)
    private String validadoMultas;

    /** SI / NO. Art.18(4). */
    @Column(name = "validado_convenios", nullable = false, length = 3)
    private String validadoConvenios;

    /** SI / NO. Art.18(3). */
    @Column(name = "validado_bloqueos", nullable = false, length = 3)
    private String validadoBloqueos;

    // ── Montos y estado ───────────────────────────────────────────────────────

    /** Tasa diferenciada según tonelaje. Art.41. */
    @Column(name = "tasa_matriculacion", nullable = false, precision = 10, scale = 2)
    private BigDecimal tasaMatriculacion;

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