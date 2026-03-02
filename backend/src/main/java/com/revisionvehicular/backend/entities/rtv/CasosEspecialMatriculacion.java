package com.revisionvehicular.backend.entities.rtv;

import com.revisionvehicular.backend.entities.ant.BeneficiarioLeasing;
import com.revisionvehicular.backend.entities.ant.EntidadesTransito;
import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.pv.Propietario;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Servicio 16 — Casos Especiales en Procesos de Matriculación
 * Base legal: Art.16(16) · Art.36 · Art.37 · Art.99-102
 *
 * Gestiona vehículos con condiciones especiales: diplomáticos (SENAE),
 * CONADIS, menaje de casa, RENOVA, internación temporal, leasing y
 * fideicomiso. Aplica exenciones arancelarias (Art.36) y activa bloqueo
 * RDD automáticamente (no transferibles, Art.36(2)).
 * Para leasing las multas van al beneficiario (Art.100).
 */
@Entity
@Table(name = "rtv_caso_especial_matriculacion")
@Data
public class CasosEspecialMatriculacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_caso_especial")
    private Long idCasoEspecial;

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

    /** → rtv_inspeccion. RTV requerida. Art.4(3). */
    @ManyToOne
    @JoinColumn(name = "inspeccion_id")
    private Inspeccion inspeccion;

    /**
     * → rtv_bloqueo_vehiculo_srv. Bloqueo RDD activado automáticamente
     * para vehículos exonerados (no transferibles). Art.36(2).
     */
    @ManyToOne
    @JoinColumn(name = "bloqueo_rdd_id")
    private BloqueoVehiculo bloqueoRdd;

    /**
     * → ant_beneficiario_leasing. Para tipo LEASING o FIDEICOMISO.
     * Art.99-101.
     */
    @ManyToOne
    @JoinColumn(name = "beneficiario_leasing_id")
    private BeneficiarioLeasing beneficiarioLeasing;

    // ── Tipo de caso (Art.36-37) ──────────────────────────────────────────────

    @Column(name = "numero_tramite", nullable = false, unique = true, length = 30)
    private String numeroTramite;

    /**
     * MENAJE / DIPLOMATICO / DISCAPACITADO / RENOVA /
     * INTERNACION_TEMPORAL / LEASING / FIDEICOMISO. Art.36-37.
     */
    @Column(name = "tipo_caso_especial", nullable = false, length = 30)
    private String tipoCasoEspecial;

    // ── Exención arancelaria SENAE (Art.36) ───────────────────────────────────

    /** Link al DAI o resolución SENAE para exención arancelaria. Art.36. */
    @Column(name = "documento_senae", length = 255)
    private String documentoSenae;

    /** Número de resolución SENAE. Art.36. */
    @Column(name = "numero_resolucion_senae", length = 50)
    private String numeroResolucionSenae;

    /**
     * SI / NO. Vehículos con exención no pueden transferirse
     * (bloqueo RDD activado automáticamente). Art.36(2).
     */
    @Column(name = "es_no_negociable", nullable = false, length = 3)
    private String esNoNegociable;

    // ── CONADIS (Art.37(1)) ───────────────────────────────────────────────────

    /** Número de carnet CONADIS. Requerido cuando tipo = DISCAPACITADO. Art.37(1). */
    @Column(name = "carnet_conadis", length = 30)
    private String carnetConadis;

    /**
     * Porcentaje certificado por CONADIS.
     * Determina el nivel de exoneración. Art.37(1).
     */
    @Column(name = "porcentaje_discapacidad", precision = 5, scale = 2)
    private BigDecimal porcentajeDiscapacidad;

    // ── Leasing y fideicomiso (Art.99-101) ────────────────────────────────────

    /** SI / NO. Activa registro en ant_beneficiario_leasing. Art.99. */
    @Column(name = "es_leasing_fideicomiso", nullable = false, length = 3)
    private String esLeasingFideicomiso;

    // ── Montos de exoneración (Art.37) ────────────────────────────────────────

    /** Porcentaje de exoneración aplicado sobre el total (0-100). Art.37. */
    @Column(name = "porcentaje_exencion", precision = 5, scale = 2)
    private BigDecimal porcentajeExencion;

    /** Monto exonerado en USD. Art.37. */
    @Column(name = "monto_exonerado", precision = 10, scale = 2)
    private BigDecimal montoExonerado;

    /** Monto cobrado efectivamente después de aplicar descuentos. Art.37. */
    @Column(name = "monto_cobrado", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoCobrado;

    // ── Validaciones ──────────────────────────────────────────────────────────

    /** SI / NO. Art.83. */
    @Column(name = "validado_bund", nullable = false, length = 3)
    private String validadoBund;

    /** SI / NO. Art.36. */
    @Column(name = "validado_sri", nullable = false, length = 3)
    private String validadoSri;

    /** SI / NO. Art.18(3). */
    @Column(name = "validado_multas", nullable = false, length = 3)
    private String validadoMultas;

    /** SI / NO. Art.18(4). */
    @Column(name = "validado_convenios", nullable = false, length = 3)
    private String validadoConvenios;

    // ── Estado ────────────────────────────────────────────────────────────────

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