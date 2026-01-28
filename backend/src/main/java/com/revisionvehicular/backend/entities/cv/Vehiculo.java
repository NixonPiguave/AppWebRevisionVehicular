package com.revisionvehicular.backend.entities.cv;

import com.revisionvehicular.backend.entities.pv.Propietario;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import jakarta.persistence.*;
import lombok.Data;

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

    @ManyToOne
    @JoinColumn(name = "Id_Propietario")
    private Propietario propietario;

    @Column(nullable = false, length = 50, unique = true)
    private String matricula;

    @Column(nullable = false, length = 50)
    private String chasis;

    @Column(name = "VIN",nullable = false, length = 50)
    private String vin;

    @ManyToOne
    @JoinColumn(name = "id_modelo", nullable = false)
    private ModeloVehiculo modeloVehiculo;

    @Column(name = "anio_fabricacion")
    private Integer anioFabricacion;

    @Column(length = 50)
    private String color;

    @Column(name = "fecha_registro")
    private LocalDate fechaAltaRegistro;
    @Column(name = "ultima_fecha_matricula")
    private LocalDate fechaMatricula;

    @Column(name= "estado_vehiculo",length = 50)
    private String estado;

    @Column(name="capacidad_pasajeros",nullable = false)
    private Integer cantidad;

    @ManyToOne
    @JoinColumn(name = "tipo_vehiculo_id", nullable = false)
    private TipoVehiculo tipoVehiculo;

    @ManyToOne
    @JoinColumn(name = "cap_carga_id", nullable = false)
    private CapCarga capCarga;


    @ManyToOne
    @JoinColumn(name = "ambito_operacional_id", nullable = false)
    private AmbitoOperacional ambitoOperacional;

    @ManyToOne
    @JoinColumn(name = "ejes_id", nullable = false)
    private Ejes ejes;

    @ManyToOne
    @JoinColumn(name = "traccion_id", nullable = false)
    private Traccion traccion;

    @ManyToOne
    @JoinColumn(name = "tipo_combustible_id")
    private TipoCombustible tipoCombustible;

    @ManyToOne
    @JoinColumn(name = "tipo_matricula_id")
    private TipoMatricula tipoMatricula;

    @ManyToOne
    @JoinColumn(name = "subcategoria_id")
    private Subcategoria subcategoria;

    @OneToMany(mappedBy = "vehiculo", cascade = CascadeType.ALL)
    private List<com.revisionvehicular.backend.entities.rtv.Inspeccion> inspecciones = new ArrayList<>();

    @OneToMany(mappedBy = "vehiculo", cascade = CascadeType.ALL)
    private List<com.revisionvehicular.backend.entities.pv.HistorialPropietario> historialPropietarios = new ArrayList<>();


}