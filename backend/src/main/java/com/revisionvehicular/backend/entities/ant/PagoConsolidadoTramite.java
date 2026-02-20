package com.revisionvehicular.backend.entities.ant;

import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.pv.Propietario;
import com.revisionvehicular.backend.entities.rtv.TramiteMatriculacion;
import com.revisionvehicular.backend.entities.srtv.MetodosPago;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "ant_pago_consolidado_tramite")
@Data
public class PagoConsolidadoTramite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pago_consolidado")
    private Long idPagoConsolidado;

    @ManyToOne
    @JoinColumn(name = "id_tramite", nullable = false)
    private TramiteMatriculacion tramite;

    @ManyToOne
    @JoinColumn(name = "propietario_id", nullable = false)
    private Propietario propietario;

    @ManyToOne
    @JoinColumn(name = "vehiculo_id", nullable = false)
    private Vehiculo vehiculo;

    @ManyToOne
    @JoinColumn(name = "id_entidad", nullable = false)
    private EntidadesTransito entidadTransito;

    @ManyToOne
    @JoinColumn(name = "id_metodo_pago", nullable = false)
    private MetodosPago metodoPago;

    @Column(name = "fecha_pago", nullable = false)
    private LocalDateTime fechaPago;

    @Column(name = "monto_multas_infracciones", precision = 10, scale = 2)
    private BigDecimal montoMultasInfracciones;

    @Column(name = "monto_multa_calendarizacion", precision = 10, scale = 2)
    private BigDecimal montoMultaCalendarizacion;

    @Column(name = "monto_multa_anual", precision = 10, scale = 2)
    private BigDecimal montoMultaAnual;

    @Column(name = "monto_deuda_vehicular", precision = 10, scale = 2)
    private BigDecimal montoDeudaVehicular;

    @Column(name = "monto_tasa_servicio", precision = 10, scale = 2)
    private BigDecimal montoTasaServicio;

    @Column(name = "monto_total", nullable = false, precision = 12, scale = 2)
    private BigDecimal montoTotal;

    @Column(name = "numero_comprobante", length = 50)
    private String numeroComprobante;

    /** Link al comprobante de pago */
    @Column(name = "documento_pago", length = 255)
    private String documentoPago;

    @Column(name = "estado", nullable = false, length = 20)
    private String estado;
}
