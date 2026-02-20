package com.revisionvehicular.backend.entities.rtv;

import com.revisionvehicular.backend.entities.ant.EntidadesTransito;
import com.revisionvehicular.backend.entities.pv.Propietario;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "rtv_gestor_matriculacion")
@Data
public class GestorMatriculacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_gestor")
    private Long idGestor;

    @ManyToOne
    @JoinColumn(name = "propietario_id", nullable = false)
    private Propietario propietario;

    @ManyToOne
    @JoinColumn(name = "id_concesionaria", nullable = false)
    private Concesionaria concesionaria;

    @ManyToOne
    @JoinColumn(name = "id_entidad_autoriza", nullable = false)
    private EntidadesTransito entidadAutoriza;

    @Column(name = "numero_carnet", length = 30)
    private String numeroCarnet;

    /** Link a la foto digital del gestor */
    @Column(name = "foto_url", length = 255)
    private String fotoUrl;

    @Column(name = "fecha_autorizacion", nullable = false)
    private LocalDate fechaAutorizacion;

    @Column(name = "fecha_vencimiento", nullable = false)
    private LocalDate fechaVencimiento;

    /** SI / NO - validado en IESS */
    @Column(name = "relacion_laboral_iess", nullable = false, length = 255)
    private String relacionLaboralIess;

    @Column(name = "observaciones", length = 255)
    private String observaciones;

    /** ACTIVO / SUSPENDIDO / REVOCADO / VENCIDO */
    @Column(name = "estado", nullable = false, length = 20)
    private String estado;
}
