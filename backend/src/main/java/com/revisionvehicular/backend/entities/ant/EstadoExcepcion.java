package com.revisionvehicular.backend.entities.ant;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "ant_estado_excepcion")
@Data
public class EstadoExcepcion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_estado_excepcion")
    private Long idEstadoExcepcion;

    @Column(name = "codigo", length = 50, nullable = false, unique = true)
    private String codigo;

    @Column(name = "finaliza", nullable = false)
    private Boolean finaliza;

    @Column(name = "estado", length = 20, nullable = false)
    private String estado;
}
