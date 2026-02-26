package com.revisionvehicular.backend.entities.rtv;

import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.pv.Propietario;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "rtv_transferencia_dominio")
@Data
public class TransferenciaDominio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_transferencia")
    private Long idTransferencia;

    @ManyToOne
    @JoinColumn(name = "id_tramite", nullable = false)
    private TramiteMatriculacion tramite;

    @ManyToOne
    @JoinColumn(name = "vehiculo_id", nullable = false)
    private Vehiculo vehiculo;

    @ManyToOne
    @JoinColumn(name = "propietario_anterior_id", nullable = false)
    private Propietario propietarioAnterior;

    @ManyToOne
    @JoinColumn(name = "propietario_nuevo_id", nullable = false)
    private Propietario propietarioNuevo;

    /** COMPRA_VENTA / REMATE / DONACION / HERENCIA / LEASING / FIDEICOMISO / PERMUTA */
    @Column(name = "tipo_transferencia", nullable = false, length = 50)
    private String tipoTransferencia;

    @Column(name = "fecha_contrato", nullable = false)
    private LocalDate fechaContrato;

    @Column(name = "numero_notaria", length = 50)
    private String numeroNotaria;

    @Column(name = "numero_registro_mercantil", length = 50)
    private String numeroRegistroMercantil;

    @Column(name = "valor_transferencia", precision = 12, scale = 2)
    private BigDecimal valorTransferencia;

    /** NATURAL / JURIDICA / MENOR / FALLECIDO / INTERDICTO */
    @Column(name = "condicion_propietario", length = 50)
    private String condicionPropietario;

    /** Link al documento soporte */
    @Column(name = "documento_habilitante", length = 255)
    private String documentoHabilitante;

    /** SI / NO */
    @Column(name = "validado_sri_nuevo_propietario", nullable = false, length = 255)
    private String validadoSriNuevoPropietario;

    @Column(name = "observaciones", length = 255)
    private String observaciones;

    @Column(name = "estado", nullable = false, length = 20)
    private String estado;
}
