package com.revisionvehicular.backend.entities.ant;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "ant_placa_disponible")
@Data
public class PlacaDisponible {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_placa_disponible")
    private Long idPlacaDisponible;

    @Column(name = "serie_alfanumerica", nullable = false, length = 10, unique = true)
    private String serieAlfanumerica;

    @Column(name = "letra_provincia", nullable = false, length = 3)
    private String letraProvincia;

    /** PARTICULAR / PUBLICO / ESTATAL */
    @Column(name = "tipo_servicio", nullable = false, length = 30)
    private String tipoServicio;

    /** Letra secuencial (A-Z) para el tercer carácter */
    @Column(name = "letra_secuencial", nullable = false, length = 1)
    private String letraSecuencial;

    @Column(name = "fecha_recepcion", nullable = false)
    private LocalDateTime fechaRecepcion;

    /** DISPONIBLE / ASIGNADA */
    @Column(name = "estado", nullable = false, length = 20)
    private String estado;
}

