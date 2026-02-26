package com.revisionvehicular.backend.entities.rtv;

import com.revisionvehicular.backend.entities.cv.Vehiculo;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "rtv_adhesivo_rtv")
@Data
public class AdhesivoRtv {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_adhesivo")
    private Long idAdhesivo;

    @ManyToOne
    @JoinColumn(name = "inspeccion_id", nullable = false)
    private Inspeccion inspeccion;

    @ManyToOne
    @JoinColumn(name = "vehiculo_id", nullable = false)
    private Vehiculo vehiculo;

    @Column(name = "periodo", nullable = false)
    private Integer periodo;

    @Column(name = "numero_adhesivo", nullable = false, unique = true, length = 30)
    private String numeroAdhesivo;

    @Column(name = "fecha_emision", nullable = false)
    private LocalDate fechaEmision;

    @Column(name = "fecha_caducidad", nullable = false)
    private LocalDate fechaCaducidad;

    /** VIGENTE / VENCIDO / ANULADO */
    @Column(name = "estado", nullable = false, length = 20)
    private String estado;
}
