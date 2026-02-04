package com.revisionvehicular.backend.entities.cv;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "cv_subcategoria")
@Data
public class Subcategoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long subcategoriaid;

    @Column(nullable = false, length = 50, unique = true)
    private String codigo;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 255)
    private String descripcion;

    @ManyToOne
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @Column(length = 50)
    private String estado;
}