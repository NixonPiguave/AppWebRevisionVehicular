package com.revisionvehicular.backend.entities.rtv;

import com.revisionvehicular.backend.entities.ant.EntidadesTransito;
import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.pv.Propietario;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Servicio 04 — Duplicado del Documento Anual de Circulación
 * Base legal: Art.16(4) · Art.18 · Art.29
 *
 * Marca el original como DUPLICADO en rtv_documento_circulacion y crea
 * uno nuevo con la MISMA fecha de caducidad (no se extiende la vigencia).
 * La placa no cambia.
 */
@Entity
@Table(name = "rtv_duplicado_doc_circulacion")
@Data
public class DuplicadoDocCirculacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_duplicado_doc")
    private Long idDuplicadoDoc;

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

    // ── Motivo (Art.29) ───────────────────────────────────────────────────────

    @Column(name = "numero_tramite", nullable = false, unique = true, length = 30)
    private String numeroTramite;

    /** DETERIORO / PERDIDA / ROBO. Art.29. */
    @Column(name = "motivo_duplicado", nullable = false, length = 20)
    private String motivoDuplicado;

    /** Obligatorio cuando motivo = ROBO. Art.29. */
    @Column(name = "numero_denuncia_policial", length = 50)
    private String numeroDenunciaPolicial;

    // ── Documentos ────────────────────────────────────────────────────────────

    /** → rtv_documento_circulacion. Original que pasa a estado DUPLICADO. Art.29. */
    @ManyToOne
    @JoinColumn(name = "documento_original_id", nullable = false)
    private DocumentoCirculacion documentoOriginal;

    /**
     * → rtv_documento_circulacion. Nuevo con es_duplicado = SI y
     * la misma fecha de caducidad del original. Art.29.
     */
    @ManyToOne
    @JoinColumn(name = "documento_nuevo_id", nullable = false)
    private DocumentoCirculacion documentoNuevo;

    /** Monto cobrado. Art.29. */
    @Column(name = "tasa_duplicado", nullable = false, precision = 10, scale = 2)
    private BigDecimal tasaDuplicado;

    // ── Validaciones (Art.18) ─────────────────────────────────────────────────

    /** SI / NO. Art.83. */
    @Column(name = "validado_bund", nullable = false, length = 3)
    private String validadoBund;

    /** SI / NO. Art.18(3). */
    @Column(name = "validado_multas", nullable = false, length = 3)
    private String validadoMultas;

    /** SI / NO. Art.18(4). */
    @Column(name = "validado_convenios", nullable = false, length = 3)
    private String validadoConvenios;

    /** SI / NO. Art.18(3). */
    @Column(name = "validado_bloqueos", nullable = false, length = 3)
    private String validadoBloqueos;

    // ── Estado ────────────────────────────────────────────────────────────────

    /** INICIADO / EN_PROCESO / CONCLUIDO / ANULADO. */
    @Column(name = "estado", nullable = false, length = 20)
    private String estado;

    @Column(name = "fecha_solicitud", nullable = false)
    private LocalDateTime fechaSolicitud;

    @Column(name = "fecha_conclusion")
    private LocalDateTime fechaConclusion;
}