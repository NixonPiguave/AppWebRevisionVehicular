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
 * Servicio 06 — Cambio de Servicio
 * Base legal: Art.4 · Art.16(6) · Art.38 · Art.39 · Art.121
 *
 * Verifica restricción Art.38: vehículos ≥12 pasajeros o ≥3.5 ton
 * no pueden pasar a PARTICULAR sin justificación.
 * El color de placa cambia según Art.121 Tabla 4. Requiere nueva RTV.
 *
 * NOTA: amplía rtv_cambio_servicio con los campos completos del documento
 * (validaciones, placas, restricción Art.38).
 */
@Entity
@Table(name = "rtv_cambio_servicio_srv")
@Data
public class CambioServicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cambio_servicio_srv")
    private Long idCambioServicioSrv;

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

    /** → rtv_inspeccion. RTV bajo parámetros del nuevo servicio. Art.4(3). */
    @ManyToOne
    @JoinColumn(name = "inspeccion_id")
    private Inspeccion inspeccion;

    // ── Cambio de servicio (Art.38-39, Art.121) ───────────────────────────────

    @Column(name = "numero_tramite", nullable = false, unique = true, length = 30)
    private String numeroTramite;

    /** Tipo de servicio antes del cambio. Art.121. */
    @Column(name = "servicio_anterior", nullable = false, length = 30)
    private String servicioAnterior;

    /** Nuevo tipo de servicio solicitado. Art.121. */
    @Column(name = "servicio_nuevo", nullable = false, length = 30)
    private String servicioNuevo;

    /** Color anterior según Art.121 Tabla 4. */
    @Column(name = "color_placa_anterior", nullable = false, length = 20)
    private String colorPlacaAnterior;

    /** Nuevo color según Art.121 Tabla 4 (BLANCO / VERDE / ORO / AZUL / ROJO / NARANJA). */
    @Column(name = "color_placa_nuevo", nullable = false, length = 20)
    private String colorPlacaNuevo;

    /** → ant_placa. Placa anterior dada de baja. Art.121. */
    @ManyToOne
    @JoinColumn(name = "placa_baja_id", nullable = false)
    private Placa placaBaja;

    /** → ant_placa. Nueva placa con color correcto emitida. Art.121. */
    @ManyToOne
    @JoinColumn(name = "placa_nueva_id", nullable = false)
    private Placa placaNueva;

    /**
     * SI / NO. Verifica que no supere 12 pasajeros ni 3.5 ton
     * para cambiar a PARTICULAR. Art.38.
     */
    @Column(name = "cumple_restriccion_art38", nullable = false, length = 3)
    private String cumpleRestriccionArt38;

    /** Requerida si supera límites Art.38 y solicita servicio PARTICULAR. */
    @Column(name = "justificacion_no_lucrativa", length = 255)
    private String justificacionNoLucrativa;

    // ── Validaciones (Art.39 = Art.18) ────────────────────────────────────────

    /** SI / NO. Art.83. */
    @Column(name = "validado_bund", nullable = false, length = 3)
    private String validadoBund;

    /** SI / NO. Art.39. */
    @Column(name = "validado_sri", nullable = false, length = 3)
    private String validadoSri;

    /** SI / NO. Art.39. */
    @Column(name = "validado_multas", nullable = false, length = 3)
    private String validadoMultas;

    /** SI / NO. Art.39. */
    @Column(name = "validado_convenios", nullable = false, length = 3)
    private String validadoConvenios;

    /** SI / NO. Art.39. */
    @Column(name = "validado_bloqueos", nullable = false, length = 3)
    private String validadoBloqueos;

    // ── Montos y estado ───────────────────────────────────────────────────────

    /** Monto cobrado. Art.39. */
    @Column(name = "tasa_cambio_servicio", nullable = false, precision = 10, scale = 2)
    private BigDecimal tasaCambioServicio;

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