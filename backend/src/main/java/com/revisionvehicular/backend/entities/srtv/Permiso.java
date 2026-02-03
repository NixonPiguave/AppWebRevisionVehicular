package com.revisionvehicular.backend.entities.srtv;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "srtv_permiso")
public class Permiso {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "permiso_id")
    private Long permisoId;

    @Column(nullable = false, unique = true, length = 100)
    private String codigo;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 100)
    private String modulo;

    @Column(length = 50)
    private String estado;

    @Column(length = 255)
    private String descripcion;
}