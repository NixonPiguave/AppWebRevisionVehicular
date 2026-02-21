package com.revisionvehicular.backend.entities.ant;

import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "ant_bloqueo_vehiculo")
@Data
public class BloqueoVehiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_bloqueo")
    private Long idBloqueo;

    @ManyToOne
    @JoinColumn(name = "vehiculo_id", nullable = false)
    private Vehiculo vehiculo;

    @ManyToOne
    @JoinColumn(name = "id_tipo_bloqueo", nullable = false)
    private TipoBloqueo tipoBloqueo;

    @Column(name = "codigo_bloqueo", nullable = false, length = 20)
    private String codigoBloqueo;

    @Column(name = "motivo", nullable = false, length = 255)
    private String motivo;

    /** TODOS / TRANSFERENCIA / MATRICULACION / etc. */
    @Column(name = "procesos_bloqueados", length = 255)
    private String procesosBloqueados;

    @Column(name = "fecha_activacion", nullable = false)
    private LocalDateTime fechaActivacion;

    @Column(name = "fecha_desactivacion")
    private LocalDateTime fechaDesactivacion;

    @Column(name = "institucion_origen", length = 100)
    private String institucionOrigen;

    /** Link al documento habilitante */
    @Column(name = "documento_soporte", length = 255)
    private String documentoSoporte;

    @ManyToOne
    @JoinColumn(name = "usuario_activa_id", nullable = false)
    private Usuario usuarioActiva;

    @ManyToOne
    @JoinColumn(name = "usuario_desactiva_id")
    private Usuario usuarioDesactiva;

    @Column(name = "observacion", length = 255)
    private String observacion;

    /** ACTIVO / DESACTIVADO */
    @Column(name = "estado", nullable = false, length = 20)
    private String estado;
}
