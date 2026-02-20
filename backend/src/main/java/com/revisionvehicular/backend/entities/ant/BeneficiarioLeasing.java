package com.revisionvehicular.backend.entities.ant;

import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.pv.Propietario;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "ant_beneficiario_leasing")
@Data
public class BeneficiarioLeasing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_beneficiario")
    private Long idBeneficiario;

    @ManyToOne
    @JoinColumn(name = "vehiculo_id", nullable = false)
    private Vehiculo vehiculo;

    @ManyToOne
    @JoinColumn(name = "propietario_leasing_id", nullable = false)
    private Propietario propietarioLeasing;

    @ManyToOne
    @JoinColumn(name = "beneficiario_id", nullable = false)
    private Propietario beneficiario;

    /** LEASING / FIDEICOMISO */
    @Column(name = "tipo_figura", nullable = false, length = 20)
    private String tipoFigura;

    @Column(name = "numero_contrato", nullable = false, length = 50)
    private String numeroContrato;

    /** Link al contrato digitalizado */
    @Column(name = "contrato_url", length = 255)
    private String contratoUrl;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDate fechaFin;

    /** SI / NO */
    @Column(name = "registrado_sri", nullable = false, length = 255)
    private String registradoSri;

    @Column(name = "estado", nullable = false, length = 20)
    private String estado;
}
