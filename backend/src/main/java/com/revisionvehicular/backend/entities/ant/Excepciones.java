package com.revisionvehicular.backend.entities.ant;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "ant_estado_excepcion")
@Data
public class Excepciones {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_estado_excepcion")
    private Long idEstadoExcepcion;

    //ROBO, DAÑO GRAVE, FUERZA_MAYOR, CONCESIONARIA, PROCESO JUDICIAL
    @Column(name = "codigo", length = 50, nullable = false, unique = true)
    private String codigo;

    @Column(name = "descripcion", length = 255, nullable = false)
    private String descripcion;

    @Column(name = "finaliza", length = 20, nullable = false)
    private String finaliza;

    @Column(name = "estado", length = 20, nullable = false)
    private String estado;
}
