package com.revisionvehicular.backend.entities.rtv;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "rtv_tipo_defecto")
@Data
public class TipoDefecto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long tipo_defecto_id;

    @Column(nullable = false, length = 50, unique = true)
    private String codigo;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 255)
    private String descripcion;

    @Column(length = 50)
    private String estado;
}