package com.revisionvehicular.backend.entities.cv;

import jakarta.persistence.*;
import lombok.Data;

/**
 * Datos de fabricación del vehículo según registro oficial.
 * Usado en inspección visual para comparar con datos registrados.
 */
@Entity
@Table(name = "cv_datos_fabrica")
@Data
public class DatosFabrica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "datos_fabrica_id")
    private Long datosFabricaId;

    @Column(nullable = false, length = 50, unique = true)
    private String matricula;

    @Column(nullable = false, length = 50)
    private String chasis;

    @Column(name = "vin", nullable = false, length = 50)
    private String vin;

    @Column(nullable = false, length = 100)
    private String marca;

    @Column(nullable = false, length = 100)
    private String modelo;

    @Column(length = 50)
    private String color;

    @Column(name = "anio_fabricacion")
    private Integer anioFabricacion;

    @Column(length = 10)
    private String estado = "A";
}
