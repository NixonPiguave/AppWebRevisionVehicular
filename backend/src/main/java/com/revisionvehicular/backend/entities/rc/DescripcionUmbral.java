package com.revisionvehicular.backend.entities.rc;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "rc_descripcion_umbral")
@Data
public class DescripcionUmbral {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long descrip_umbral_id;

    @Column(nullable = false, length = 255)
    private String descripcion;

    @ManyToOne
    @JoinColumn(name = "umbral_id", nullable = false)
    private Umbral umbral;

    @Column(length = 50)
    private String estado;
}