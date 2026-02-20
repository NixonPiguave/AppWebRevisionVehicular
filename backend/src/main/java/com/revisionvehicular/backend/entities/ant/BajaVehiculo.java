package com.revisionvehicular.backend.entities.ant;

import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.rtv.TramiteMatriculacion;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "ant_baja_vehiculo")
@Data
public class BajaVehiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_baja")
    private Long idBaja;

    @ManyToOne
    @JoinColumn(name = "id_tramite", nullable = false)
    private TramiteMatriculacion tramite;

    @ManyToOne
    @JoinColumn(name = "vehiculo_id", nullable = false)
    private Vehiculo vehiculo;

    /** VIDA_UTIL / NO_APROBACION_RTV / SINIESTRO / ROBO / JUDICIAL / PERDIDA_TOTAL */
    @Column(name = "motivo_baja", nullable = false, length = 50)
    private String motivoBaja;

    @Column(name = "empresa_chatarrizado", length = 150)
    private String empresaChatarrizado;

    /** Link al certificado de chatarrización emitido por empresa autorizada MIPRO */
    @Column(name = "certificado_chatarrizado", length = 255)
    private String certificadoChatarrizado;

    @Column(name = "fecha_chatarrizado")
    private LocalDate fechaChatarrizado;

    /** Link al documento judicial si aplica */
    @Column(name = "orden_judicial", length = 255)
    private String ordenJudicial;

    @Column(name = "fecha_baja", nullable = false)
    private LocalDate fechaBaja;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    /** SI / NO */
    @Column(name = "notificado_sri", nullable = false, length = 255)
    private String notificadoSri;

    @Column(name = "observaciones", length = 255)
    private String observaciones;

    @Column(name = "estado", nullable = false, length = 20)
    private String estado;
}
