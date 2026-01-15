package com.revisionvehicular.backend.entities.rtv;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "rtv_defecto")
@Data
public class Defecto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long defecto_id;

    @Column(nullable = false, length = 50, unique = true)
    private String codigo;

    @Column(nullable = false, length = 255)
    private String descripcion;

    @Column(nullable = false, length = 50)
    private String gravedad;

    @ManyToOne
    @JoinColumn(name = "tipo_defecto_id", nullable = false)
    private TipoDefecto tipoDefecto;

    @ManyToOne
    @JoinColumn(name = "subfamilia_id")
    private Subfamilia subfamilia;

    @Column(length = 50)
    private String estado;
}