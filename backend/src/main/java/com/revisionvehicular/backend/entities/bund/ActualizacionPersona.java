package com.revisionvehicular.backend.entities.bund;

import com.revisionvehicular.backend.entities.ant.EntidadesTransito;
import com.revisionvehicular.backend.entities.pv.Propietario;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bund_actualizacion_persona")
@Data
public class ActualizacionPersona {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_actualizacion")
    private Long idActualizacion;

    @ManyToOne
    @JoinColumn(name = "propietario_id", nullable = false)
    private Propietario propietario;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "id_entidad", nullable = false)
    private EntidadesTransito entidad;

    /**
     * CIUDADANO / MILITAR / POLICIA / MENOR / EXTRANJERO / INTERDICTO / etc.
     */
    @Column(name = "condicion_persona", length = 30)
    private String condicionPersona;

    @Column(name = "estado_civil", length = 20)
    private String estadoCivil;

    /** SI / NO */
    @Column(name = "tiene_discapacidad", nullable = false, length = 255)
    private String tieneDiscapacidad;

    /** SI / NO */
    @Column(name = "perdida_derechos", nullable = false, length = 255)
    private String perdidaDerechos;

    /** SI / NO */
    @Column(name = "fallecido", nullable = false, length = 255)
    private String fallecido;

    /** SI / NO */
    @Column(name = "cedula_anulada", nullable = false, length = 255)
    private String cedulaAnulada;

    @Column(name = "domicilio_actualizado", length = 255)
    private String domicilioActualizado;

    @Column(name = "correo_actualizado", length = 100)
    private String correoActualizado;

    @Column(name = "telefono_actualizado", length = 20)
    private String telefonoActualizado;

    @Column(name = "provincia_domicilio", length = 50)
    private String provinciaDomicilio;

    @Column(name = "canton_domicilio", length = 50)
    private String cantonDomicilio;

    /** SI / NO */
    @Column(name = "validado_registro_civil", nullable = false, length = 255)
    private String validadoRegistroCivil;

    /** SI / NO */
    @Column(name = "validado_sri", nullable = false, length = 255)
    private String validadoSri;

    /** SI / NO */
    @Column(name = "validado_cne_votacion", nullable = false, length = 255)
    private String validadoCneVotacion;

    @Column(name = "fecha_actualizacion", nullable = false)
    private LocalDateTime fechaActualizacion;

    /** Vigencia de 2 años (Art. 83) */
    @Column(name = "fecha_vencimiento", nullable = false)
    private LocalDate fechaVencimiento;

    /** VIGENTE / VENCIDO */
    @Column(name = "estado", nullable = false, length = 20)
    private String estado;
}
