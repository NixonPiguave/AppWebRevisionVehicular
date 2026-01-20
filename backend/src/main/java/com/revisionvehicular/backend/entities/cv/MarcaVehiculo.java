package com.revisionvehicular.backend.entities.cv;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "cv_marca_vehiculo")
@Data
public class MarcaVehiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_marca")
    private Long idMarca;

    @Column(name = "nombre", length = 100, nullable = false, unique = true)
    private String nombre;

    @Column(name = "empresa", length = 100, nullable = false, unique = true)
    private String empresa;

    @Column(name = "pais_origen", length = 50)
    private String paisOrigen;

    @Column(name = "grupoAutomotriz", length = 100, nullable = false, unique = true)
    private String grupoAutomotriz;

    @Column(name = "fechaAlta", nullable = false, unique = true)
    private LocalDateTime fechaAlta;

    @Column(name = "fechaBaja", nullable = false, unique = true)
    private LocalDateTime fechaBaja;

    @Column(name = "logo_url", length = 255)
    private String logoUrl;

    @Column(name = "estado", length = 20, nullable = false)
    private String estado;

    @OneToMany(mappedBy = "marca", cascade = CascadeType.ALL)
    private List<ModeloVehiculo> modelos;
}
