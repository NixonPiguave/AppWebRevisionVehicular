package com.revisionvehicular.backend.entities.cv;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "cv_tipo_combustible")
@Data
public class TipoCombustible {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long tipocombustibleid;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 255)
    private String descripcion;

    @Column(length = 50)
    private String estado;
}