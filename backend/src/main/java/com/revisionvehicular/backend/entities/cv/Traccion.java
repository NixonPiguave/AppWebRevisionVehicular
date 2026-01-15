package com.revisionvehicular.backend.entities.cv;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "cv_traccion")
@Data
public class Traccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long traccion_id;

    @Column(nullable = false, length = 100)
    private String tipo;

    @Column(length = 255)
    private String descripcion;

    @Column(length = 50)
    private String estado;
}