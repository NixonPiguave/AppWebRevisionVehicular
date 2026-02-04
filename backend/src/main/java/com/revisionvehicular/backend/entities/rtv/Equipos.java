package com.revisionvehicular.backend.entities.rtv;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "rtv_equipos")
@Data
public class Equipos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="equipo_id")
    private Long equipoid;
    @Column(nullable = false, length = 100)
    private String equipo;
    @Column(nullable = false, length = 100)
    private String modelo;
    @Column(name="serial_equipo",nullable = false, length = 100)
    private String serialEquipo;
    @Column(name="codigo_interno",nullable = false, length = 100)
    private String codigoInterno;
    @Column(name="fecha_ultimo_mantenimiento",nullable = false)
    private LocalDateTime ultimoMantenimiento;
    @Column(name="fecha_ultima_calibracion",nullable = false)
    private LocalDateTime ultimaCalibracion;
    @Column(name="influencia",nullable = false, length = 100)
    private Integer influencia;
    @Column(length = 50)
    private String estado;
}
