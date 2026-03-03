package com.revisionvehicular.backend.entities.rtv;

import com.revisionvehicular.backend.entities.ant.EntidadesTransito;
import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Servicio 11 — Registro de Observaciones
 * Base legal: Art.16(11) · Art.48 · Art.49
 *
 * Anotaciones técnicas o administrativas sobre el vehículo.
 * Cuando tipo = GEMELO el sistema activa automáticamente un bloqueo COBY
 * e inicia investigación (Art.49).
 */
@Entity
@Table(name = "rtv_observacion_vehiculo_srv")
@Data
public class RegistroObservacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_observacion_srv")
    private Long idObservacionSrv;

    // ── Referencias a entidades existentes ───────────────────────────────────

    @ManyToOne
    @JoinColumn(name = "id_tramite", nullable = false)
    private TramiteMatriculacion tramite;

    @ManyToOne
    @JoinColumn(name = "vehiculo_id", nullable = false)
    private Vehiculo vehiculo;

    @ManyToOne
    @JoinColumn(name = "id_entidad", nullable = false)
    private EntidadesTransito entidad;

    /** Funcionario que registra la observación. Art.48. */
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    /**
     * → rtv_bloqueo_vehiculo_srv. Bloqueo COBY activado automáticamente
     * cuando tipo_observacion = GEMELO. Art.49.
     */
    @ManyToOne
    @JoinColumn(name = "bloqueo_coby_id")
    private BloqueoVehiculo bloqueoCoby;

    // ── Observación (Art.48-49) ───────────────────────────────────────────────

    @Column(name = "numero_tramite", nullable = false, unique = true, length = 30)
    private String numeroTramite;

    /**
     * BAJA_VEHICULO / CAMBIO_SERVICIO / GEMELO / CAMBIO_MOTOR / REMARCADO.
     * Art.48.
     */
    @Column(name = "tipo_observacion", nullable = false, length = 30)
    private String tipoObservacion;

    /** Descripción detallada de la observación. Art.48. */
    @Column(name = "descripcion", nullable = false, length = 500)
    private String descripcion;

    /** Link al documento técnico o judicial que sustenta. Art.48. */
    @Column(name = "documento_soporte", nullable = false, length = 255)
    private String documentoSoporte;

    /**
     * SI / NO. Se activa automáticamente cuando tipo_observacion = GEMELO.
     * Art.49.
     */
    @Column(name = "genera_bloqueo_coby", nullable = false, length = 3)
    private String generaBloqueoCoby;

    // ── Estado y levantamiento (Art.49) ───────────────────────────────────────

    /** ACTIVA / LEVANTADA. */
    @Column(name = "estado", nullable = false, length = 20)
    private String estado;

    /** Fecha y hora de creación de la observación. */
    @Column(name = "fecha_registro", nullable = false)
    private LocalDateTime fechaRegistro;

    /** Fecha en que se resolvió y se levantó la observación. Art.49. */
    @Column(name = "fecha_levantamiento")
    private LocalDateTime fechaLevantamiento;

    /**
     * Descripción de la resolución. Art.49.
     * BAJA_VEHICULO: la observación NUNCA se levanta.
     */
    @Column(name = "motivo_levantamiento", length = 255)
    private String motivoLevantamiento;
}