package com.revisionvehicular.backend.entities.rc;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Table(name = "rc_umbral")
@Data
public class Umbral {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long umbral_id;

    @Column(name = "valor_min", precision = 10, scale = 2)
    private BigDecimal valorMin;

    @Column(name = "valor_max", precision = 10, scale = 2)
    private BigDecimal valorMax;

    @ManyToOne
    @JoinColumn(name = "unidad_medida_id")
    private UnidadMedida unidadMedida;

    @Column(length = 50)
    private String estado;
}