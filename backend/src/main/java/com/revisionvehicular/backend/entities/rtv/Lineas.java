package com.revisionvehicular.backend.entities.rtv;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "rtv_lineas")
@Data
public class Lineas {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long lineaid;

    @Column(nullable = false, length = 100)
    private String nombre;
    @Column(nullable = false, length = 200)
    private String descripcion;

    @Column(length = 50)
    private String estado;
}