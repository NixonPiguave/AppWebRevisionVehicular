package com.revisionvehicular.backend.entities.rtv;

import com.revisionvehicular.backend.entities.ant.EntidadesTransito;
import com.revisionvehicular.backend.entities.ant.TipoBloqueo;
import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Servicio 09 — Bloqueo de Vehículo
 * Base legal: Art.16(9) · Art.50 · Art.51 · Art.52
 *
 * BA / FA / RB / COBY / ROBO bloquean TODOS los procesos.
 * TDD solo bloquea transferencias.
 * RDD bloquea transferencias y casos especiales.
 * La institución que activa debe coincidir con inst_autorizada del catálogo.
 */
@Entity
@Table(name = "rtv_bloqueo_vehiculo_srv")
@Data
public class BloqueoVehiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_bloqueo_srv")
    private Long idBloqueoSrv;

    // ── Referencias a entidades existentes ───────────────────────────────────

    @ManyToOne
    @JoinColumn(name = "id_tramite", nullable = false)
    private TramiteMatriculacion tramite;

    @ManyToOne
    @JoinColumn(name = "vehiculo_id", nullable = false)
    private Vehiculo vehiculo;

    /**
     * → ant_entidad_transito. Institución que activa el bloqueo.
     * Debe coincidir con inst_autorizada del tipo. Art.52.
     */
    @ManyToOne
    @JoinColumn(name = "id_entidad", nullable = false)
    private EntidadesTransito entidad;

    @ManyToOne
    @JoinColumn(name = "usuario_activa_id", nullable = false)
    private Usuario usuarioActiva;

    // ── Tipo y motivo (Art.51-52) ─────────────────────────────────────────────

    @Column(name = "numero_tramite", nullable = false, unique = true, length = 30)
    private String numeroTramite;

    /**
     * → ant_tipo_bloqueo. Catálogo de tipos: BA / FA / RB / COBY /
     * TDD / RDD / ROBO / PRENDA_COMERCIAL / PRENDA_INDUSTRIAL /
     * POSESION_EFECTIVA. Art.51.
     */
    @ManyToOne
    @JoinColumn(name = "tipo_bloqueo_id", nullable = false)
    private TipoBloqueo tipoBloqueo;

    /** Descripción del motivo del bloqueo. Art.52. */
    @Column(name = "motivo", nullable = false, length = 255)
    private String motivo;

    /**
     * TODOS / TRANSFERENCIA / CASOS_ESPECIALES.
     * Según tipo en catálogo Art.51.
     */
    @Column(name = "procesos_bloqueados", nullable = false, length = 50)
    private String procesosBloqueados;

    /**
     * Link al documento obligatorio según tipo:
     * boleta captura / denuncia policial / mandato judicial / contrato notariado.
     * Art.52.
     */
    @Column(name = "documento_habilitante", nullable = false, length = 255)
    private String documentoHabilitante;

    /** Nombre de la institución que solicita el bloqueo. Art.52. */
    @Column(name = "institucion_origen", nullable = false, length = 100)
    private String institucionOrigen;

    // ── Estado y fechas ───────────────────────────────────────────────────────

    /** Fecha y hora exacta de activación. Art.52. */
    @Column(name = "fecha_activacion", nullable = false)
    private LocalDateTime fechaActivacion;

    /** ACTIVO / DESACTIVADO. */
    @Column(name = "estado", nullable = false, length = 20)
    private String estado;

    @Column(name = "observaciones", length = 255)
    private String observaciones;
}