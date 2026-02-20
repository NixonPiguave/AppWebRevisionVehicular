package com.revisionvehicular.backend.entities.ant;

import com.revisionvehicular.backend.entities.cv.Vehiculo;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "ant_exencion_arancelaria")
@Data
public class ExencionArancelaria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_exencion")
    private Long idExencion;

    @ManyToOne
    @JoinColumn(name = "vehiculo_id", nullable = false)
    private Vehiculo vehiculo;

    /** MENAJE / DIPLOMATICO / DISCAPACITADO / RENOVA / INTERNACION_TEMPORAL */
    @Column(name = "tipo_exencion", nullable = false, length = 50)
    private String tipoExencion;

    /** Link al documento SENAE/DAI */
    @Column(name = "documento_senae", length = 255)
    private String documentoSenae;

    @Column(name = "numero_resolucion", length = 50)
    private String numeroResolucion;

    @Column(name = "fecha_autorizacion", nullable = false)
    private LocalDate fechaAutorizacion;

    @Column(name = "fecha_caducidad")
    private LocalDate fechaCaducidad;

    /** SI / NO */
    @Column(name = "no_negociable", nullable = false, length = 255)
    private String noNegociable;

    @Column(name = "estado", nullable = false, length = 20)
    private String estado;
}
