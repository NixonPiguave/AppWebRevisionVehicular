package com.revisionvehicular.backend.entities.rtv;

import com.revisionvehicular.backend.entities.ant.EntidadesTransito;
import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.pv.Propietario;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "rtv_certificacion_vehicular")
@Data
public class CertificacionVehicular {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_certificacion")
    private Long idCertificacion;

    @ManyToOne
    @JoinColumn(name = "vehiculo_id")
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

    /** CUV / POSEER_VEHICULO / HISTORIAL_INFRACCIONES */
    @Column(name = "tipo_certificado", nullable = false, length = 50)
    private String tipoCertificado;

    @Column(name = "numero_certificado", nullable = false, unique = true, length = 50)
    private String numeroCertificado;

    /** PROPIETARIO / AUTORIZADO / AUTORIDAD */
    @Column(name = "solicitante_tipo", nullable = false, length = 30)
    private String solicitanteTipo;

    @Column(name = "fecha_emision", nullable = false)
    private LocalDateTime fechaEmision;

    /** SI / NO */
    @Column(name = "tiene_costo", nullable = false, length = 255)
    private String tieneCosto;

    @Column(name = "estado", nullable = false, length = 20)
    private String estado;
}
