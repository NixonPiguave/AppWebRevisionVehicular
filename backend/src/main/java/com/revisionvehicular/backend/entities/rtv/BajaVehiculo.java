package com.revisionvehicular.backend.entities.rtv;

import com.revisionvehicular.backend.entities.ant.EntidadesTransito;
import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.pv.Propietario;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Servicio 12 — Baja de Vehículos
 * Base legal: Art.16(12) · Art.62 · Art.63 · Art.64 · Art.65
 *
 * PROCESO IRREVERSIBLE (Art.62). Elimina definitivamente el vehículo
 * del registro activo. Valida la causal (5 opciones Art.63), exige
 * certificado de chatarrización de empresa autorizada por MIPRO (Art.64)
 * y notifica al SRI para baja tributaria (Art.65).
 */
@Entity
@Table(name = "rtv_baja_vehiculo")
@Data
public class BajaVehiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_baja")
    private Long idBaja;

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

    // ── Causal (Art.63) ───────────────────────────────────────────────────────

    @Column(name = "numero_tramite", nullable = false, unique = true, length = 30)
    private String numeroTramite;

    /**
     * VIDA_UTIL / NO_APROBACION_RTV / SINIESTRO / ROBO / JUDICIAL.
     * Cinco causales válidas. Art.63.
     */
    @Column(name = "motivo_baja", nullable = false, length = 30)
    private String motivoBaja;

    /** Detalle de la causal específica. Art.63. */
    @Column(name = "descripcion_motivo", nullable = false, length = 500)
    private String descripcionMotivo;

    // ── Causal: 3 reprobaciones consecutivas (Art.63(2)) ──────────────────────

    /**
     * → rtv_inspeccion. 1er período reprobado.
     * Solo para motivo = NO_APROBACION_RTV. Art.63(2).
     */
    @ManyToOne
    @JoinColumn(name = "inspeccion_1_id")
    private Inspeccion inspeccion1;

    /** → rtv_inspeccion. 2do período reprobado. Art.63(2). */
    @ManyToOne
    @JoinColumn(name = "inspeccion_2_id")
    private Inspeccion inspeccion2;

    /** → rtv_inspeccion. 3er período reprobado consecutivo. Art.63(2). */
    @ManyToOne
    @JoinColumn(name = "inspeccion_3_id")
    private Inspeccion inspeccion3;

    // ── Chatarrización (Art.64) ───────────────────────────────────────────────

    /**
     * Empresa autorizada por MIPRO.
     * Obligatoria para motivo = VIDA_UTIL y SINIESTRO. Art.64.
     */
    @Column(name = "empresa_chatarrizado", length = 100)
    private String empresaChatarrizado;

    /** Link al certificado de chatarrización. Art.64. */
    @Column(name = "cert_chatarrizado", length = 255)
    private String certChatarrizado;

    /** Fecha del proceso de chatarrización. Art.64. */
    @Column(name = "fecha_chatarrizado")
    private LocalDate fechaChatarrizado;

    // ── Documentos según causal ───────────────────────────────────────────────

    /** Link a la orden judicial. Obligatorio para motivo = JUDICIAL. Art.63(5). */
    @Column(name = "orden_judicial", length = 255)
    private String ordenJudicial;

    /** Link a la denuncia policial. Obligatorio para motivo = ROBO. Art.63(4). */
    @Column(name = "constancia_policial", length = 255)
    private String constanciaPolicial;

    // ── Notificación SRI (Art.65) ─────────────────────────────────────────────

    /** SI / NO. Notificación al SRI para eliminación del registro tributario. Art.65. */
    @Column(name = "notificado_sri", nullable = false, length = 3)
    private String notificadoSri;

    /** Fecha de notificación al SRI. Art.65. */
    @Column(name = "fecha_notificacion_sri")
    private LocalDate fechaNotificacionSri;

    // ── Estado ────────────────────────────────────────────────────────────────

    /** CONCLUIDO — proceso IRREVERSIBLE. Art.62. */
    @Column(name = "estado", nullable = false, length = 20)
    private String estado;

    @Column(name = "fecha_solicitud", nullable = false)
    private LocalDateTime fechaSolicitud;

    @Column(name = "fecha_conclusion")
    private LocalDateTime fechaConclusion;
}