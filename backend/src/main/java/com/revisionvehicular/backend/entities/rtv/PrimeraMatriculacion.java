package com.revisionvehicular.backend.entities.rtv;

import com.revisionvehicular.backend.entities.ant.CalendarizacionMatriculacion;
import com.revisionvehicular.backend.entities.ant.EntidadesTransito;
import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.pv.Propietario;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Servicio 01 — Emisión de Matrícula por Primera Vez
 * Base legal: Art.4 · Art.16(1) · Art.18 · Art.22 · Art.83 · Art.119-121 · Art.133
 */
@Entity
@Table(name = "rtv_primera_matriculacion")
@Data
public class PrimeraMatriculacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_primera_matriculacion")
    private Long idPrimeraMatriculacion;

    // ── Referencias a entidades existentes ───────────────────────────────────

    @ManyToOne
    @JoinColumn(name = "id_tramite")
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

    /** → rtv_inspeccion. Inspección RTV aprobada. Art.4(3). */
    @ManyToOne
    @JoinColumn(name = "inspeccion_id")
    private Inspeccion inspeccion;

    /** → ant_calendarizacion_matriculacion. Período asignado. Art.12. */
    @ManyToOne
    @JoinColumn(name = "id_calendarizacion")
    private CalendarizacionMatriculacion calendarizacion;

    // ── Identificación del trámite ────────────────────────────────────────────

    /** Código único del trámite. Ej: TRM-2025-00441. */
    @Column(name = "numero_tramite", nullable = false, unique = true, length = 30)
    private String numeroTramite;

    /** Número RAMV devuelto por webservice SRI. Art.18(1). */
    @Column(name = "numero_ramv", nullable = false, length = 30)
    private String numeroRamv;

    // ── Placa emitida (Art.119-121) ───────────────────────────────────────────

    /** Placa asignada: 3 letras + 4 dígitos. Art.119. */
    @Column(name = "numero_placa", nullable = false, length = 10)
    private String numeroPlaca;

    /** Primera letra identifica la provincia de registro. Art.120. */
    @Column(name = "letra_provincia", nullable = false, length = 1)
    private String letraProvincia;

    /** BLANCO / VERDE / ORO / AZUL / ROJO / NARANJA / AMARILLO. Art.121 Tabla 4. */
    @Column(name = "color_placa", nullable = false, length = 20)
    private String colorPlaca;

    /** PARTICULAR / PUBLICO / COMERCIAL / GOBIERNO / DIPLOMATICO / IT. Art.121. */
    @Column(name = "tipo_servicio_placa", nullable = false, length = 30)
    private String tipoServicioPlaca;

    // ── Validaciones obligatorias (Art.18) ────────────────────────────────────

    /** SI / NO. BUND del propietario vigente (máx. 2 años). Art.83. */
    @Column(name = "validado_bund", nullable = false, length = 3)
    private String validadoBund;

    /** SI / NO. Vehículo HABILITADO en SRI. Art.18(1). */
    @Column(name = "validado_sri", nullable = false, length = 3)
    private String validadoSri;

    /** SI / NO. Certificado de homologación del modelo VIGENTE. Art.22(2). */
    @Column(name = "validado_homologacion", nullable = false, length = 3)
    private String validadoHomologacion;

    /** SI / NO. Impuestos vehiculares SRI pagados (MATRICULACION + RODAJE + IVA). Art.18(2). */
    @Column(name = "validado_impuestos_sri", nullable = false, length = 3)
    private String validadoImpuestosSri;

    /** SI / NO. Sin multas ni deudas vehiculares pendientes. Art.18(3). */
    @Column(name = "validado_multas", nullable = false, length = 3)
    private String validadoMultas;

    /** SI / NO. Sin bloqueos activos en ant_bloqueo_vehiculo. Art.18(3). */
    @Column(name = "validado_bloqueos", nullable = false, length = 3)
    private String validadoBloqueos;

    /** SI / NO. Sin convenios de pago VENCIDOS. Art.18(4).
     *  Un convenio vencido bloquea TODOS los trámites. */
    @Column(name = "validado_convenios", nullable = false, length = 3)
    private String validadoConvenios;

    // ── Montos y documentos ───────────────────────────────────────────────────

    /** Tasa cobrada por el GAD (distinta al impuesto SRI). Art.13 / Art.15. */
    @Column(name = "monto_tasa_servicio", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoTasaServicio;

    /** Link al acta de entrega firmada y digitalizada. Art.133. */
    @Column(name = "acta_entrega_placa", length = 255)
    private String actaEntregaPlaca;

    // ── Estado del trámite (Art.4) ────────────────────────────────────────────

    /** SOLICITUD / PAGO / RTV / EMISION / CONCLUIDO / ANULADO. Etapas Art.4. */
    @Column(name = "etapa_actual", nullable = false, length = 20)
    private String etapaActual;

    /** INICIADO / EN_PROCESO / CONCLUIDO / ANULADO. */
    @Column(name = "estado", nullable = false, length = 20)
    private String estado;

    @Column(name = "fecha_solicitud", nullable = false)
    private LocalDateTime fechaSolicitud;

    @Column(name = "fecha_conclusion")
    private LocalDateTime fechaConclusion;

    @Column(name = "observaciones", length = 500)
    private String observaciones;
}