package com.revisionvehicular.backend.entities.rtv;

import com.revisionvehicular.backend.entities.ant.EntidadesTransito;
import com.revisionvehicular.backend.entities.ant.Placa;
import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.pv.Propietario;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Servicio 03 — Duplicado de Documento de Matrícula
 * Base legal: Art.16(3) · Art.18 · Art.29 · Art.128 · Art.133
 *
 * Emite una placa de reemplazo por deterioro, pérdida o robo.
 * Da de baja la placa anterior y emite la nueva con es_duplicado = SI.
 * Para ROBO requiere denuncia policial.
 */
@Entity
@Table(name = "rtv_duplicado_matricula")
@Data
public class DuplicadoMatricula {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_duplicado_matricula")
    private Long idDuplicadoMatricula;

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

    // ── Motivo y documentos (Art.29) ──────────────────────────────────────────

    @Column(name = "numero_tramite", nullable = false, unique = true, length = 30)
    private String numeroTramite;

    /** DETERIORO / PERDIDA / ROBO. Art.29. */
    @Column(name = "motivo_duplicado", nullable = false, length = 20)
    private String motivoDuplicado;

    /** Obligatorio cuando motivo = ROBO. Art.29. */
    @Column(name = "numero_denuncia_policial", length = 50)
    private String numeroDenunciaPolicial;

    /** Link a la denuncia policial digitalizada. Art.29. */
    @Column(name = "documento_denuncia", length = 255)
    private String documentoDenuncia;

    // ── Placas (Art.128) ──────────────────────────────────────────────────────

    /** → ant_placa. Placa que se da de baja (estado = BAJA). Art.128. */
    @ManyToOne
    @JoinColumn(name = "placa_anterior_id", nullable = false)
    private Placa placaAnterior;

    /** → ant_placa. Nueva placa emitida con es_duplicado = SI. Art.128. */
    @ManyToOne
    @JoinColumn(name = "placa_nueva_id", nullable = false)
    private Placa placaNueva;

    /** Monto cobrado por el duplicado. Art.128. */
    @Column(name = "tasa_duplicado", nullable = false, precision = 10, scale = 2)
    private BigDecimal tasaDuplicado;

    /** Link al acta de entrega firmada y digitalizada. Art.133. */
    @Column(name = "acta_entrega", nullable = false, length = 255)
    private String actaEntrega;

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