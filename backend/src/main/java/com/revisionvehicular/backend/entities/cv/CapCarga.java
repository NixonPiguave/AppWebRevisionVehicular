package com.revisionvehicular.backend.entities.cv;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Table(name = "cv_cap_carga")
@Data
public class CapCarga {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long capcargaid;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal capacidad;

    @Column(length = 50)
    private String unidad;

    @Column(length = 255)
    private String descripcion;

    @Column(length = 50)
    private String estado;
}