package com.revisionvehicular.backend.entities.rc;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "rc_descripcion_umbral")
@Data
public class DescripcionUmbral {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name ="descrip_umbral_id")
    private Long descripUmbralId;

    @Column(nullable = false, length = 255)
    private String descripcion;

    @Column(length = 50)
    private String estado;
}