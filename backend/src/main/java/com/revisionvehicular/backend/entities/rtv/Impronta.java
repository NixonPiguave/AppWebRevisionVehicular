package com.revisionvehicular.backend.entities.rtv;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "rtv_impronta")
@Data
public class Impronta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long impronta_id;

    @Column(name = "fecha_registro", nullable = false)
    private LocalDateTime fechaRegistro;

    @Column(length = 500)
    private String descripcion;

    @ManyToOne
    @JoinColumn(name = "inspeccion_id", nullable = false)
    private Inspeccion inspeccion;

    @Column(length = 50)
    private String estado;
}