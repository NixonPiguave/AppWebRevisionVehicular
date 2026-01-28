package com.revisionvehicular.backend.entities.cv;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "cv_ejes")
@Data
public class Ejes {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="ejes_id")
    private Long ejesid;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(length = 255)
    private String descripcion;

    @Column(length = 50)
    private String estado;
}