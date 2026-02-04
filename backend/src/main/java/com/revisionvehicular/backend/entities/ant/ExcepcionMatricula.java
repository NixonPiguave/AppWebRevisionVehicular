package com.revisionvehicular.backend.entities.ant;

import com.revisionvehicular.backend.entities.cv.Vehiculo;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "ant_excepcion_matricula_vehiculo")
@Data
public class ExcepcionMatricula{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_excepcion")
    private Long idExcepcion;

    // Tipo de excepción (robo, daño, concesionaria, fuerza mayor, proceso legal, etc.)
    @ManyToOne
    @JoinColumn(name = "id_estado_excepcion", nullable = false)
    private Excepciones estadoExcepcion;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDate fechaFin;

    @Column(name = "articulo_legal", length = 100)
    private String articuloLegal;

    @Column(name = "observacion", length = 500)
    private String observacion;

    @Column(name = "estado", length = 20, nullable = false)
    private String estado;
}
