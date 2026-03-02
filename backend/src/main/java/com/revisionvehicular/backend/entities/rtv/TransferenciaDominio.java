package com.revisionvehicular.backend.entities.rtv;

import com.revisionvehicular.backend.entities.ant.BeneficiarioLeasing;
import com.revisionvehicular.backend.entities.ant.EntidadesTransito;
import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.pv.Propietario;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Servicio 05 — Transferencia de Dominio
 * Base legal: Art.4 · Art.16(5) · Art.30-35 · Art.83 · Art.99-102
 *
 * Valida BUND y SRI de ambas partes, revisa bloqueos TDD/RDD,
 * actualiza pv_historial_propietario. Para leasing/fideicomiso
 * activa ant_beneficiario_leasing (Art.99-101).
 *
 * NOTA: esta entidad unifica y amplía rtv_transferencia_dominio
 * con los campos completos exigidos por el documento.
 */
@Entity
@Table(name = "rtv_transferencia_dominio_srv")
@Data
public class TransferenciaDominio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_transferencia_srv")
    private Long idTransferenciaSrv;

    // ── Referencias a entidades existentes ───────────────────────────────────

    @ManyToOne
    @JoinColumn(name = "id_tramite", nullable = false)
    private TramiteMatriculacion tramite;

    @ManyToOne
    @JoinColumn(name = "vehiculo_id", nullable = false)
    private Vehiculo vehiculo;

    /** Vendedor / cedente. Art.30. */
    @ManyToOne
    @JoinColumn(name = "propietario_anterior_id", nullable = false)
    private Propietario propietarioAnterior;

    /** Comprador / adquirente. Art.34. */
    @ManyToOne
    @JoinColumn(name = "propietario_nuevo_id", nullable = false)
    private Propietario propietarioNuevo;

    @ManyToOne
    @JoinColumn(name = "id_entidad", nullable = false)
    private EntidadesTransito entidad;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    /** → rtv_inspeccion. RTV requerida. Art.4(3). */
    @ManyToOne
    @JoinColumn(name = "inspeccion_id")
    private Inspeccion inspeccion;

    // ── Tipo y documentos (Art.30-35) ─────────────────────────────────────────

    @Column(name = "numero_tramite", nullable = false, unique = true, length = 30)
    private String numeroTramite;

    /** COMPRA_VENTA / HERENCIA / DONACION / REMATE / LEASING / FIDEICOMISO. Art.30-31. */
    @Column(name = "tipo_transferencia", nullable = false, length = 30)
    private String tipoTransferencia;

    /** Fecha del contrato o escritura notarial. Art.30. */
    @Column(name = "fecha_contrato", nullable = false)
    private LocalDate fechaContrato;

    /** Número y ciudad de la notaría. Art.30. */
    @Column(name = "numero_notaria", length = 50)
    private String numeroNotaria;

    /** Valor declarado en la transferencia. Art.30. */
    @Column(name = "valor_transferencia", precision = 12, scale = 2)
    private BigDecimal valorTransferencia;

    /**
     * NORMAL / FALLECIDO / INTERDICTO / MENOR.
     * Determina flujo especial Art.33.
     */
    @Column(name = "condicion_propietario_anterior", nullable = false, length = 20)
    private String condicionPropietarioAnterior;

    /** Link a escritura, sentencia o resolución. Art.30. */
    @Column(name = "documento_habilitante", nullable = false, length = 255)
    private String documentoHabilitante;

    // ── Bloqueos y leasing ────────────────────────────────────────────────────

    /** SI / NO. Había bloqueo TDD al iniciar el trámite. Art.51. */
    @Column(name = "bloqueo_tdd_existia", nullable = false, length = 3)
    private String bloqueoTddExistia;

    /** SI / NO. Activa registro en ant_beneficiario_leasing. Art.99. */
    @Column(name = "es_leasing_fideicomiso", nullable = false, length = 3)
    private String esLeasingFideicomiso;

    /**
     * → ant_beneficiario_leasing si aplica.
     * Las multas se asignan al beneficiario, no a la arrendadora. Art.99-101.
     */
    @ManyToOne
    @JoinColumn(name = "beneficiario_leasing_id")
    private BeneficiarioLeasing beneficiarioLeasing;

    // ── Validaciones ──────────────────────────────────────────────────────────

    /** SI / NO. BUND del vendedor. Art.83. */
    @Column(name = "validado_bund_vendedor", nullable = false, length = 3)
    private String validadoBundVendedor;

    /** SI / NO. BUND del comprador. Art.83. */
    @Column(name = "validado_bund_comprador", nullable = false, length = 3)
    private String validadoBundComprador;

    /** SI / NO. Comprador habilitado en SRI. Art.34. */
    @Column(name = "validado_sri_comprador", nullable = false, length = 3)
    private String validadoSriComprador;

    /** SI / NO. Vendedor sin multas / deudas pendientes. Art.34(1). */
    @Column(name = "validado_multas_vendedor", nullable = false, length = 3)
    private String validadoMultasVendedor;

    /** SI / NO. Sin convenios vencidos. Art.34(7). */
    @Column(name = "validado_convenios", nullable = false, length = 3)
    private String validadoConvenios;

    // ── Montos y estado ───────────────────────────────────────────────────────

    /** Monto cobrado. Art.34. */
    @Column(name = "tasa_transferencia", nullable = false, precision = 10, scale = 2)
    private BigDecimal tasaTransferencia;

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