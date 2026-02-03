package com.revisionvehicular.backend.entities.ant;
import jakarta.persistence.*;
import lombok.Data;
@Entity
@Table(name = "ant_calendarizacion_matriculacion")
@Data
public class CalendarizacionMatriculacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_calendarizacion")
    private Long idCalendarizacion;

    @Column(name = "ultimo_digito_placa", nullable = false)
    private Integer ultimoDigitoPlaca;

    @Column(name = "mes", nullable = false)
    private Integer mes;

    @Column(name = "tipo", nullable = false)
    private Integer tipo;

    @Column(name = "estado", length = 20, nullable = false)
    private String estado;
}

