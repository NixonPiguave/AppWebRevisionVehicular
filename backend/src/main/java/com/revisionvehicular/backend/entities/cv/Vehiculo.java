package com.revisionvehicular.backend.entities.cv;

import jakarta.persistence.*;
import lombok.Data;
import com.revisionvehicular.backend.entities.srtv.Usuario;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cv_vehiculo")
@Data
public class Vehiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long vehiculo_id;

    @Column(nullable = false, length = 50, unique = true)
    private String matricula;

    @Column(nullable = false, length = 50)
    private String chasis;

    @Column(length = 50)
    private String marca;

    @Column(length = 50)
    private String modelo;

    @Column(name = "anio_fabricacion")
    private Integer anioFabricacion;

    @Column(length = 50)
    private String color;

    @Column(name = "fecha_alta_registro")
    private LocalDate fechaAltaRegistro;

    @Column(length = 50)
    private String estado;

    @ManyToOne
    @JoinColumn(name = "tipo_vehiculo_id", nullable = false)
    private TipoVehiculo tipoVehiculo;

    @OneToOne
    @JoinColumn(name = "cap_carga_id", nullable = false)
    private CapCarga capCarga;

    @OneToOne
    @JoinColumn(name = "cap_pasajeros_id", nullable = false)
    private CapPasajeros capPasajeros;

    @OneToOne
    @JoinColumn(name = "ambito_operacional_id", nullable = false)
    private AmbitoOperacional ambitoOperacional;

    @OneToOne
    @JoinColumn(name = "ejes_id", nullable = false)
    private Ejes ejes;

    @OneToOne
    @JoinColumn(name = "traccion_id", nullable = false)
    private Traccion traccion;

    @ManyToOne
    @JoinColumn(name = "propietario_id", nullable = false)
    private Usuario usuario;


    @ManyToOne
    @JoinColumn(name = "tipo_combustible_id")
    private TipoCombustible tipoCombustible;

    @ManyToOne
    @JoinColumn(name = "tipo_matricula_id")
    private TipoMatricula tipoMatricula;

    @ManyToOne
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    @ManyToOne
    @JoinColumn(name = "subcategoria_id")
    private Subcategoria subcategoria;

    @OneToMany(mappedBy = "vehiculo", cascade = CascadeType.ALL)
    private List<com.revisionvehicular.backend.entities.rtv.Inspeccion> inspecciones = new ArrayList<>();
}