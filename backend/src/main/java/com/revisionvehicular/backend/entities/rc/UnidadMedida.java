package com.revisionvehicular.backend.entities.rc;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "rc_unidad_medida")
@Data
public class UnidadMedida {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "umedida_id")
    private Long umedidaid;

    @Column(nullable = false, length = 50)
    private String nombre;

    @Column(nullable = false, length = 20)
    private String simbolo;

    @Column(length = 255)
    private String descripcion;

    @Column(length = 50)
    private String estado;
}