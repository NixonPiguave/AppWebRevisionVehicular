package com.revisionvehicular.backend.entities.ant;

import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "ant_observacion_vehiculo")
@Data
public class ObservacionVehiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_observacion")
    private Long idObservacion;

    @ManyToOne
    @JoinColumn(name = "vehiculo_id", nullable = false)
    private Vehiculo vehiculo;

    /** BAJA_VEHICULO / CAMBIO_SERVICIO / GEMELO / CAMBIO_MOTOR / REMARCADO */
    @Column(name = "tipo_observacion", nullable = false, length = 50)
    private String tipoObservacion;

    @Column(name = "descripcion", nullable = false, length = 255)
    private String descripcion;

    /** Link al documento habilitante */
    @Column(name = "documento_soporte", length = 255)
    private String documentoSoporte;

    @Column(name = "fecha_registro", nullable = false)
    private LocalDateTime fechaRegistro;

    @Column(name = "fecha_levantamiento")
    private LocalDateTime fechaLevantamiento;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    /** ACTIVA / LEVANTADA */
    @Column(name = "estado", nullable = false, length = 20)
    private String estado;
}
