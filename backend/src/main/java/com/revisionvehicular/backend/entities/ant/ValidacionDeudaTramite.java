package com.revisionvehicular.backend.entities.ant;

import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.pv.Propietario;
import com.revisionvehicular.backend.entities.rtv.TramiteMatriculacion;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "ant_validacion_deuda_tramite")
@Data
public class ValidacionDeudaTramite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_validacion")
    private Long idValidacion;

    @ManyToOne
    @JoinColumn(name = "id_tramite", nullable = false)
    private TramiteMatriculacion tramite;

    @ManyToOne
    @JoinColumn(name = "vehiculo_id", nullable = false)
    private Vehiculo vehiculo;

    @ManyToOne
    @JoinColumn(name = "propietario_id", nullable = false)
    private Propietario propietario;

    @Column(name = "fecha_validacion", nullable = false)
    private LocalDateTime fechaValidacion;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    /** SI / NO */
    @Column(name = "tiene_multas_infracciones", nullable = false, length = 255)
    private String tieneMultasInfracciones;

    @Column(name = "monto_multas_infracciones", precision = 12, scale = 2)
    private BigDecimal montoMultasInfracciones;

    /** SI / NO */
    @Column(name = "tiene_convenios_vencidos", nullable = false, length = 255)
    private String tieneConveniosVencidos;

    @Column(name = "monto_convenios_vencidos", precision = 12, scale = 2)
    private BigDecimal montoConveniosVencidos;

    /** SI / NO */
    @Column(name = "tiene_deuda_vehicular", nullable = false, length = 255)
    private String tieneDeudaVehicular;

    @Column(name = "monto_deuda_vehicular", precision = 12, scale = 2)
    private BigDecimal montoDeudaVehicular;

    /** SI / NO */
    @Column(name = "tiene_multa_calendarizacion", nullable = false, length = 255)
    private String tieneMultaCalendarizacion;

    @Column(name = "monto_multa_calendarizacion", precision = 12, scale = 2)
    private BigDecimal montoMultaCalendarizacion;

    /** SI / NO */
    @Column(name = "tiene_multa_anual", nullable = false, length = 255)
    private String tieneMultaAnual;

    @Column(name = "monto_multa_anual", precision = 12, scale = 2)
    private BigDecimal montoMultaAnual;

    /** APROBADO / RECHAZADO */
    @Column(name = "resultado_validacion", nullable = false, length = 20)
    private String resultadoValidacion;

    @Column(name = "detalle_rechazo", length = 255)
    private String detalleRechazo;

    /** SI / NO */
    @Column(name = "tramite_habilitado", nullable = false, length = 255)
    private String tramiteHabilitado;

    @Column(name = "estado", nullable = false, length = 20)
    private String estado;
}
