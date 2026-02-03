package com.revisionvehicular.backend.entities.cv;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "ant_documento_matricula")
@Data
public class DocumentoMatricula {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_documento_matricula")
    private Long idDocumentoMatricula;

    @ManyToOne
    @JoinColumn(name = "id_vehiculo", nullable = false)
    private Vehiculo vehiculo;

    @Column(name = "fecha_emision", nullable = false)
    private LocalDate fechaEmision;

    @Column(name = "fecha_caducidad", nullable = false)
    private LocalDate fechaCaducidad;

    @Column(name = "vigencia_anios", nullable = false)
    private Integer vigenciaAnios; // siempre 4

    @Column(name = "estado", length = 20, nullable = false)
    private String estado;
}


