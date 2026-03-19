package com.revisionvehicular.backend.entities.ant;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "ant_solicitud_placas")
@Data
public class SolicitudPlacasAnt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_solicitud")
    private Long idSolicitud;

    @Column(name = "fecha_solicitud", nullable = false)
    private LocalDateTime fechaSolicitud;

    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;

    /** Letra de provincia (A, P, G, etc.) */
    @Column(name = "letra_provincia", nullable = false, length = 3)
    private String letraProvincia;

    /** Tipo servicio/matrícula: PARTICULAR / PUBLICO / ESTATAL (y otros si aplica) */
    @Column(name = "tipo_servicio", nullable = false, length = 30)
    private String tipoServicio;

    /** PENDIENTE / RECIBIDO */
    @Column(name = "estado", nullable = false, length = 20)
    private String estado;
}

