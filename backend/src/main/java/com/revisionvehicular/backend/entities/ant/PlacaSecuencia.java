package com.revisionvehicular.backend.entities.ant;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "ant_placa_secuencia", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"letra_provincia", "tipo_servicio"})
})
@Data
public class PlacaSecuencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_secuencia")
    private Long idSecuencia;

    @Column(name = "letra_provincia", nullable = false, length = 3)
    private String letraProvincia;

    @Column(name = "tipo_servicio", nullable = false, length = 30)
    private String tipoServicio;

    /** Índice 0..25 para la 3ra letra */
    @Column(name = "indice_actual", nullable = false)
    private Integer indiceActual;
}

