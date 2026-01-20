package com.revisionvehicular.backend.entities.cv;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "cv_modelo_vehiculo")
@Data
public class ModeloVehiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_modelo")
    private Long idModelo;

    @Column(name = "nombre", length = 100, nullable = false)
    private String nombre;

    @Column(name = "anio_desde")
    private Integer anioDesde;

    @Column(name = "anio_hasta")
    private Integer anioHasta;

    @Column(name = "estado", length = 20, nullable = false)
    private String estado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_marca", nullable = false)
    private MarcaVehiculo marca;
}
