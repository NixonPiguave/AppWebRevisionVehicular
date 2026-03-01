package com.revisionvehicular.backend.entities.srtv;

import com.revisionvehicular.backend.entities.ant.EntidadesTransito;
import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.pv.Propietario;
import com.revisionvehicular.backend.entities.rtv.TramiteMatriculacion;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "rtv_turnos")
@Data
public class Turnos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "turno_id")
    private Long turnoId;

    @ManyToOne
    @JoinColumn(name = "propietario_id")
    private Propietario propietario;

    @ManyToOne
    @JoinColumn(name = "vehiculo_id")
    private Vehiculo vehiculo;

    @ManyToOne
    @JoinColumn(name = "id_tipo_tramite", nullable = false)
    private Servicio servicio;
    //comentario para subir
    @ManyToOne
    @JoinColumn(name = "id_tramite")
    private TramiteMatriculacion tramite;

    @ManyToOne
    @JoinColumn(name = "id_entidad", nullable = false)
    private EntidadesTransito entidad;

    /** Fecha en la que se genera el turno */
    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    /** Fecha en la que el turno fue atendido (si aplica) */
    @Column(name = "fecha_fin")
    private LocalDate fechaFin;

    /** Fecha en la que el turno fue cancelado/anulado (si aplica) */
    @Column(name = "fecha_cancelado")
    private LocalDate fechaCancelado;

    /** GENERADO / CONFIRMADO / ATENDIDO / CANCELADO */
    @Column(name = "estado", length = 35)
    private String estado;
}