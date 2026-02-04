package com.revisionvehicular.backend.entities.cv;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "cv_ambito_operacional")
@Data
public class AmbitoOperacional {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="ambito_operacionalid")
    private Long ambitoOperacionalId;

    @Column(nullable = false, length = 100)
    private String ambito;

    @Column(length = 255)
    private String descripcion;

    @Column(length = 50)
    private String estado;
}