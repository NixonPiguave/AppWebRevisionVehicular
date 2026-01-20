package com.revisionvehicular.backend.entities.pv;

import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.rc.Umbral;
import com.revisionvehicular.backend.entities.rtv.Defecto;
import com.revisionvehicular.backend.entities.rtv.Inspeccion;
import com.revisionvehicular.backend.entities.rtv.MetodoInspeccion;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;


@Entity
@Table(name = "pv_propietario")
@Data
public class Propietario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id_Propietario")
    private Long idPropietario  ;

    @Column(name = "DocumentoIdentidad",length = 30, nullable = false)
    private String documentoIdentidad;

    @Column(name = "Nombre",nullable = false, length = 30)
    private String nombre;

    @Column(name = "Telefono",length = 30)
    private Integer telefono;

    @Column(name = "Correo",nullable = true, length = 30)
    private String correo;

    @Column(name = "Direccion",nullable = true, length = 45)
    private String direccion;

    @Column(nullable = false)
    private LocalDateTime fecharegistro;

    @ManyToOne
    @JoinColumn(name = "vehiculo_id", nullable = false)
    private Vehiculo vehiculo;
}
