package com.revisionvehicular.backend.entities.ant;

import com.revisionvehicular.backend.entities.cv.ModeloVehiculo;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "ant_homologacion")
@Data
public class Homologacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_homologacion")
    private Long idHomologacion;

    @ManyToOne
    @JoinColumn(name = "id_modelo", nullable = false)
    private ModeloVehiculo modeloVehiculo;

    @Column(name = "numero_certificado", nullable = false, unique = true, length = 50)
    private String numeroCertificado;

    @Column(name = "fecha_emision", nullable = false)
    private LocalDate fechaEmision;

    @Column(name = "fecha_caducidad")
    private LocalDate fechaCaducidad;

    @Column(name = "norma_tecnica", length = 100)
    private String normaTecnica;

    /** VIGENTE / VENCIDO / REVOCADO */
    @Column(name = "estado", nullable = false, length = 20)
    private String estado;
}
