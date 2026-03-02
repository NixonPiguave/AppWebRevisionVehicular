package com.revisionvehicular.backend.entities.rtv;

import com.revisionvehicular.backend.entities.ant.EntidadesTransito;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Servicio 14 — Anulación de Trámites
 * Base legal: Art.16(14) · Art.78 · Art.79 · Art.80
 *
 * Solo la entidad que inició el trámite puede anularlo (Art.78).
 * Las multas ya pagadas NO se devuelven automáticamente (Art.79).
 * La marca de ANULADO es permanente e irreversible (Art.80).
 *
 * NOTA: amplía rtv_anulacion_tramite con los campos completos del
 * documento (número de trámite auditado, estado al anular, reversión
 * económica distinguiendo pagos de multas).
 */
@Entity
@Table(name = "rtv_anulacion_tramite_srv")
@Data
public class AnulacionTramiteServicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_anulacion_srv")
    private Long idAnulacionSrv;

    // ── Referencias a entidades existentes ───────────────────────────────────

    @ManyToOne
    @JoinColumn(name = "id_tramite_anulado", nullable = false)
    private TramiteMatriculacion tramiteAnulado;

    /**
     * → ant_entidad_transito.
     * Debe coincidir con id_entidad del trámite original. Art.78.
     */
    @ManyToOne
    @JoinColumn(name = "id_entidad", nullable = false)
    private EntidadesTransito entidad;

    /** Funcionario que ejecuta la anulación. Art.78. */
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    // ── Anulación (Art.78-80) ─────────────────────────────────────────────────

    /**
     * Copia del número de trámite original (auditoría permanente). Art.78.
     */
    @Column(name = "numero_tramite_anulado", nullable = false, length = 30)
    private String numeroTramiteAnulado;

    /**
     * INICIADO / EN_PROCESO.
     * Solo estos estados son anulables. Art.78.
     */
    @Column(name = "estado_tramite_al_anular", nullable = false, length = 20)
    private String estadoTramiteAlAnular;

    /** Descripción del motivo de la anulación. Art.79. */
    @Column(name = "motivo_anulacion", nullable = false, length = 500)
    private String motivoAnulacion;

    /** Link a memorando u oficio autorizante. Art.79. */
    @Column(name = "documentos_soporte", length = 255)
    private String documentosSoporte;

    // ── Reversión económica (Art.79) ──────────────────────────────────────────

    /**
     * SI / NO. Se revirtieron las transacciones económicas
     * en ant_pago_consolidado_tramite. Art.79.
     */
    @Column(name = "pagos_revertidos", nullable = false, length = 3)
    private String pagosRevertidos;

    /**
     * SI / NO. Normalmente NO — Art.79: las multas ya pagadas
     * NO se devuelven automáticamente al propietario.
     */
    @Column(name = "multas_devueltas", nullable = false, length = 3)
    private String multasDevueltas;

    // ── Estado ────────────────────────────────────────────────────────────────

    /** Fecha y hora exacta de la anulación. Art.80. */
    @Column(name = "fecha_anulacion", nullable = false)
    private LocalDateTime fechaAnulacion;

    /** ANULADO — permanente e irreversible. Art.80. */
    @Column(name = "estado", nullable = false, length = 20)
    private String estado;
}