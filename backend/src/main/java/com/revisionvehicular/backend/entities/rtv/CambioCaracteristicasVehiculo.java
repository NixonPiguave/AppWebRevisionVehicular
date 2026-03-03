package com.revisionvehicular.backend.entities.rtv;

import com.revisionvehicular.backend.entities.ant.EntidadesTransito;
import com.revisionvehicular.backend.entities.ant.ObservacionVehiculo;
import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.pv.Propietario;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Servicio 08 — Cambio de Características
 * Base legal: Art.16(8) · Art.44 · Art.45 · Art.46 · Art.47 · Art.48
 *
 * Registra cambios técnicos: cambio de motor, chasis remarcado u otras
 * características. Actualiza cv_vehiculo y genera una observación en
 * ant_observacion_vehiculo (Art.48).
 *
 * NOTA: amplía rtv_cambio_caracteristicas_vehiculo con los campos
 * completos del documento (motor/chasis nuevo, observación automática,
 * validaciones Art.47).
 */
@Entity
@Table(name = "rtv_cambio_caracteristicas_srv")
@Data
public class CambioCaracteristicasVehiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cambio_caracteristicas_srv")
    private Long idCambioCaracteristicasSrv;

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

    /** → rtv_inspeccion. RTV con nuevas características validadas. Art.4(3). */
    @ManyToOne
    @JoinColumn(name = "inspeccion_id")
    private Inspeccion inspeccion;

    /**
     * → ant_observacion_vehiculo.
     * Observación registrada automáticamente al concluir el cambio. Art.48.
     */
    @ManyToOne
    @JoinColumn(name = "observacion_vehiculo_id", nullable = false)
    private ObservacionVehiculo observacionVehiculo;

    // ── Datos del cambio (Art.44-47) ──────────────────────────────────────────

    @Column(name = "numero_tramite", nullable = false, unique = true, length = 30)
    private String numeroTramite;

    /** CAMBIO_MOTOR / REMARCADO / OTRO. Art.44. */
    @Column(name = "tipo_cambio", nullable = false, length = 30)
    private String tipoCambio;

    /** Dato anterior (ej: número de motor viejo). Art.44. */
    @Column(name = "caracteristica_anterior", nullable = false, length = 255)
    private String caracteristicaAnterior;

    /** Nuevo dato actualizado en cv_vehiculo. Art.44. */
    @Column(name = "caracteristica_nueva", nullable = false, length = 255)
    private String caracteristicaNueva;

    /** Link al informe técnico o certificado que avala el cambio. Art.47. */
    @Column(name = "documento_tecnico", nullable = false, length = 255)
    private String documentoTecnico;

    /** Nuevo número de motor. Solo cuando tipo_cambio = CAMBIO_MOTOR. Art.44. */
    @Column(name = "numero_motor_nuevo", length = 50)
    private String numeroMotorNuevo;

    /** Nuevo número de chasis. Solo cuando tipo_cambio = REMARCADO. Art.45. */
    @Column(name = "numero_chasis_nuevo", length = 50)
    private String numeroChasísNuevo;

    // ── Validaciones (Art.47) ─────────────────────────────────────────────────

    /** SI / NO. Art.83. */
    @Column(name = "validado_bund", nullable = false, length = 3)
    private String validadoBund;

    /** SI / NO. Art.47(3). */
    @Column(name = "validado_multas", nullable = false, length = 3)
    private String validadoMultas;

    /** SI / NO. Art.47(5). */
    @Column(name = "validado_convenios", nullable = false, length = 3)
    private String validadoConvenios;

    /** SI / NO. Art.47(3). */
    @Column(name = "validado_bloqueos", nullable = false, length = 3)
    private String validadoBloqueos;

    // ── Montos y estado ───────────────────────────────────────────────────────

    /** Monto cobrado. Art.47. */
    @Column(name = "tasa_cambio", nullable = false, precision = 10, scale = 2)
    private BigDecimal tasaCambio;

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