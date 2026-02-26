package com.revisionvehicular.backend.entities.ant;

import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.pv.Propietario;
import com.revisionvehicular.backend.entities.rtv.TramiteMatriculacion;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "ant_retraso_matriculacion")
@Data
public class RetrasoMatriculacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_retraso")
    private Long idRetraso;

    @ManyToOne
    @JoinColumn(name = "vehiculo_id", nullable = false)
    private Vehiculo vehiculo;

    @ManyToOne
    @JoinColumn(name = "propietario_id", nullable = false)
    private Propietario propietario;

    @ManyToOne
    @JoinColumn(name = "id_calendarizacion", nullable = false)
    private CalendarizacionMatriculacion calendarizacion;

    /** Trámite iniciado pero no concluido antes de que cambiara el período (Art. 24(4)) */
    @ManyToOne
    @JoinColumn(name = "id_tramite_inconcluso")
    private TramiteMatriculacion tramiteInconcluso;

    @ManyToOne
    @JoinColumn(name = "id_multa_cal")
    private MultaCalendarizacion multaCalendarizacion;

    @ManyToOne
    @JoinColumn(name = "id_multa_anual")
    private MultaAnualMatriculacion multaAnual;

    @Column(name = "periodo", nullable = false)
    private Integer periodo;

    @Column(name = "mes_obligatorio", nullable = false)
    private Integer mesObligatorio;

    @Column(name = "fecha_limite", nullable = false)
    private LocalDate fechaLimite;

    @Column(name = "dias_retraso")
    private Integer diasRetraso;

    /** SI / NO */
    @Column(name = "tuvo_tramite_inconcluso", nullable = false, length = 255)
    private String tuvoTramiteInconcluso;

    /** Fecha en que el sistema cerró automáticamente el trámite inconcluso */
    @Column(name = "fecha_cierre_automatico")
    private LocalDateTime fechaCierreAutomatico;

    /** SI / NO */
    @Column(name = "genero_multa_cal", nullable = false, length = 255)
    private String generoMultaCal;

    /** SI / NO */
    @Column(name = "genero_multa_anual", nullable = false, length = 255)
    private String generoMultaAnual;

    @Column(name = "fecha_regularizacion")
    private LocalDate fechaRegularizacion;

    /** PENDIENTE / REGULARIZADO / CON_MULTA */
    @Column(name = "estado", nullable = false, length = 20)
    private String estado;
}
