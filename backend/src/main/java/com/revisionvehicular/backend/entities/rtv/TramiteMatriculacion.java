package com.revisionvehicular.backend.entities.rtv;

import com.revisionvehicular.backend.entities.ant.EntidadesTransito;
import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.pv.Propietario;
import com.revisionvehicular.backend.entities.srtv.Servicio;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "rtv_tramite_matriculacion")
@Data
public class TramiteMatriculacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tramite")
    private Long idTramite;

    @ManyToOne
    @JoinColumn(name = "vehiculo_id", nullable = false)
    private Vehiculo vehiculo;

    @ManyToOne
    @JoinColumn(name = "propietario_id", nullable = false)
    private Propietario propietario;

    @ManyToOne
    @JoinColumn(name = "id_tipo_tramite", nullable = false)
    private Servicio tipoTramite;

    @ManyToOne
    @JoinColumn(name = "id_entidad", nullable = false)
    private EntidadesTransito entidad;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "id_tarifario_tramite")
    private TarifarioTramite tarifarioTramite;

    @Column(name = "numero_tramite", nullable = false, unique = true, length = 30)
    private String numeroTramite;

    /** SI / NO */
    @Column(name = "validado_sri", nullable = false, length = 255)
    private String validadoSri;

    /** SI / NO */
    @Column(name = "validado_ant_multas", nullable = false, length = 255)
    private String validadoAntMultas;

    /** SI / NO */
    @Column(name = "validado_bloqueos", nullable = false, length = 255)
    private String validadoBloqueos;

    /** SI / NO */
    @Column(name = "validado_homologacion", nullable = false, length = 255)
    private String validadoHomologacion;

    @Column(name = "fecha_solicitud", nullable = false)
    private LocalDateTime fechaSolicitud;

    @Column(name = "fecha_conclusion")
    private LocalDateTime fechaConclusion;

    @Column(name = "periodo", nullable = false)
    private Integer periodo;

    @Column(name = "observaciones", length = 255)
    private String observaciones;

    /** INICIADO / EN_PROCESO / CONCLUIDO / ANULADO */
    @Column(name = "estado", nullable = false, length = 20)
    private String estado;
}
