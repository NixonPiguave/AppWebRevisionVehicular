package com.revisionvehicular.backend.entities.cv;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "cv_cap_pasajeros")
@Data
public class CapPasajeros {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long cap_pasajeros_id;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(length = 255)
    private String descripcion;

    @Column(length = 50)
    private String estado;
}