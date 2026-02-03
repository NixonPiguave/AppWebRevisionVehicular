package com.revisionvehicular.backend.entities.ant;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "ant_calendarizacion_matricula")
@Data
public class CalendarizacionMatricula {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_calendarizacion")
    private Long idCalendarizacion;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private LocalDate fechaFin;

    @Column(name = "anio", nullable = false)
    private Integer anio;

    @Column(name = "estado", length = 20, nullable = false)
    private String estado;
}
