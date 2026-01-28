package com.revisionvehicular.backend.entities.pv;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;


@Entity
@Table(name = "pv_propietario")
@Data
public class Propietario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "propietario_id")
    private Long idPropietario  ;

    @Column(name = "documento_identidad",length = 30, nullable = false)
    private String documentoIdentidad;

    @Column(name = "nombre",nullable = false, length = 30)
    private String nombre;

    @Column(name = "telefono",length = 30)
    private Integer telefono;

    @Column(name = "correo",nullable = true, length = 30)
    private String correo;

    @Column(name = "direccion",nullable = true, length = 45)
    private String direccion;

    @Column(nullable = false)
    private LocalDate fecharegistro;

}
