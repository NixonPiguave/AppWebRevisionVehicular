package com.revisionvehicular.backend.entities.cv;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "cv_clase")
@Data
public class Clase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "clase_id")
    private Long claseId;

    @Column(nullable = false, length = 50, unique = true)
    private String clase;

    @Column(nullable = false, length = 100)
    private String descripcion;

    @Column(length = 50)
    private String estado;
}