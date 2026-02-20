package com.revisionvehicular.backend.entities.rtv;

import com.revisionvehicular.backend.entities.ant.EntidadesTransito;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "rtv_concesionaria")
@Data
public class Concesionaria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_concesionaria")
    private Long idConcesionaria;

    @ManyToOne
    @JoinColumn(name = "id_entidad_autoriza")
    private EntidadesTransito entidadAutoriza;

    @Column(name = "nombre", nullable = false, length = 150)
    private String nombre;

    @Column(name = "ruc", nullable = false, unique = true, length = 20)
    private String ruc;

    @Column(name = "representante_legal", nullable = false, length = 100)
    private String representanteLegal;

    @Column(name = "direccion", length = 255)
    private String direccion;

    @Column(name = "telefono", length = 20)
    private String telefono;

    @Column(name = "correo", length = 100)
    private String correo;

    /** SI / NO */
    @Column(name = "habilitado_sri", nullable = false, length = 255)
    private String habilitadoSri;

    @Column(name = "estado", nullable = false, length = 20)
    private String estado;
}
