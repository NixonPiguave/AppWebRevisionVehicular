package com.revisionvehicular.backend.entities.rtv;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "rtv_categoria")
@Data
public class RTVCategoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="rtvcategoria_id")
    private Long rtvcategoriaid;

    @Column(nullable = false, length = 50, unique = true)
    private String codigo;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 255)
    private String descripcion;

    @Column(length = 50)
    private String estado;
    @ManyToOne
    @JoinColumn(name = "subfamilia_id", nullable = false)
    private Subfamilia subfamilia;
}