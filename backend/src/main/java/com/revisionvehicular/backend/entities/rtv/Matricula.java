package com.revisionvehicular.backend.entities.rtv;

import com.revisionvehicular.backend.entities.ant.ExcepcionMatricula;
import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.srtv.Usuario;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "rtv_matricula")
@Data
public class Matricula {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_matricula")
    private Long idMatricula;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_vehiculo", nullable = false)
    private Vehiculo vehiculo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_inspeccion", nullable = false)
    private Inspeccion inspeccion;

    @Column(name = "periodo", nullable = false)
    private Integer periodo;

    @Column(name = "fecha_emision", nullable = false)
    private LocalDate fechaEmision;

    @Column(name = "fecha_caducidad", nullable = false)
    private LocalDate fechaCaducidad;

    @Column(name = "valor_total", precision = 10, scale = 2, nullable = false)
    private BigDecimal valorTotal;

    @Column(name = "estado", length = 20, nullable = false)
    private String estado;

    @ManyToOne
    @JoinColumn(name = "id_excepcion", nullable = true)
    private ExcepcionMatricula excepcionMatricula;

}
