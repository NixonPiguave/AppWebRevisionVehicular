package com.revisionvehicular.backend.entities.rtv;

import com.revisionvehicular.backend.entities.ant.EntidadesTransito;
import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Servicio 10 — Desbloqueo de Vehículo
 * Base legal: Art.16(10) · Art.53
 *
 * Art.53 especifica que quien desbloquea puede ser una institución
 * diferente a quien bloqueó. Debe adjuntar el documento de levantamiento
 * (constancia, resolución judicial, cancelación de deuda).
 */
@Entity
@Table(name = "rtv_desbloqueo_vehiculo")
@Data
public class DesbloqueoVehiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_desbloqueo")
    private Long idDesbloqueo;

    // ── Referencias a entidades existentes ───────────────────────────────────

    @ManyToOne
    @JoinColumn(name = "id_tramite", nullable = false)
    private TramiteMatriculacion tramite;

    /** → rtv_bloqueo_vehiculo_srv. Bloqueo que se levanta. Art.53. */
    @ManyToOne
    @JoinColumn(name = "bloqueo_id", nullable = false)
    private BloqueoVehiculo bloqueo;

    @ManyToOne
    @JoinColumn(name = "vehiculo_id", nullable = false)
    private Vehiculo vehiculo;

    /**
     * → ant_entidad_transito. Institución que levanta el bloqueo.
     * Puede ser diferente a quien lo activó. Art.53.
     */
    @ManyToOne
    @JoinColumn(name = "id_entidad", nullable = false)
    private EntidadesTransito entidad;

    /** Funcionario que registra el levantamiento. Art.53. */
    @ManyToOne
    @JoinColumn(name = "usuario_desactiva_id", nullable = false)
    private Usuario usuarioDesactiva;

    // ── Levantamiento (Art.53) ────────────────────────────────────────────────

    @Column(name = "numero_tramite", nullable = false, unique = true, length = 30)
    private String numeroTramite;

    /**
     * Link al documento de levantamiento: constancia de presentación,
     * resolución judicial, cancelación de deuda, etc. Art.53.
     */
    @Column(name = "documento_levantamiento", nullable = false, length = 255)
    private String documentoLevantamiento;

    /** Descripción de la causa del desbloqueo. Art.53. */
    @Column(name = "motivo_levantamiento", nullable = false, length = 255)
    private String motivoLevantamiento;

    // ── Estado ────────────────────────────────────────────────────────────────

    /** Fecha y hora del levantamiento efectivo. Art.53. */
    @Column(name = "fecha_desactivacion", nullable = false)
    private LocalDateTime fechaDesactivacion;

    /** CONCLUIDO / ANULADO. */
    @Column(name = "estado", nullable = false, length = 20)
    private String estado;
}