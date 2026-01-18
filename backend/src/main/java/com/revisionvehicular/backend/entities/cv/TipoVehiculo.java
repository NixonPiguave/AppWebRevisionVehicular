package com.revisionvehicular.backend.entities.cv;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "cv_tipo_vehiculo")
@Data
public class TipoVehiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long tipo_vehiculo_id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 255)
    private String descripcion;

    @Column(length = 50)
    private String estado;

    @ManyToOne
    @JoinColumn(name = "clase_id", nullable = false)
    private Clase Clase;

}
