package com.revisionvehicular.backend.entities.ant;

import com.revisionvehicular.backend.entities.cv.Vehiculo;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "ant_placa")
@Data
public class Placa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_placa")
    private Long idPlaca;

    @ManyToOne
    @JoinColumn(name = "vehiculo_id", nullable = false)
    private Vehiculo vehiculo;

    @Column(name = "serie_alfanumerica", nullable = false, length = 10)
    private String serieAlfanumerica;

    @Column(name = "letra_provincia", length = 3)
    private String letraProvincia;

    /** PARTICULAR / PUBLICO / COMERCIAL / ESTATAL / DIPLOMATICO / IT / CARGA */
    @Column(name = "tipo_servicio_placa", nullable = false, length = 30)
    private String tipoServicioPlaca;

    /** BLANCO / VERDE / ORO / AZUL / ROJO / NARANJA */
    @Column(name = "color_placa", nullable = false, length = 20)
    private String colorPlaca;

    /** SI / NO */
    @Column(name = "es_duplicado", nullable = false, length = 255)
    private String esDuplicado;

    /** SI / NO */
    @Column(name = "es_provisional", nullable = false, length = 255)
    private String esProvisional;

    @Column(name = "fecha_emision", nullable = false)
    private LocalDate fechaEmision;

    @Column(name = "fecha_vencimiento")
    private LocalDate fechaVencimiento;

    @Column(name = "fecha_baja")
    private LocalDate fechaBaja;

    @Column(name = "motivo_baja", length = 100)
    private String motivoBaja;

    @ManyToOne
    @JoinColumn(name = "entidad_emisora_id")
    private EntidadesTransito entidadEmisora;

    /** ACTIVA / BAJA / PROVISIONAL / DUPLICADA */
    @Column(name = "estado", nullable = false, length = 20)
    private String estado;
}
