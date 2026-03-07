package com.revisionvehicular.backend.entities.rtv;

import com.revisionvehicular.backend.entities.ant.EntidadesTransito;
import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;


@Entity
@Table(name = "rtv_desbloqueo_vehiculo")
@Data
public class DesbloqueoVehiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_desbloqueo")
    private Long idDesbloqueo;

    @ManyToOne
    @JoinColumn(name = "id_tramite", nullable = false)
    private TramiteMatriculacion tramite;

    @ManyToOne
    @JoinColumn(name = "bloqueo_id", nullable = false)
    private BloqueoVehiculo bloqueo;

    @ManyToOne
    @JoinColumn(name = "vehiculo_id", nullable = false)
    private Vehiculo vehiculo;

    @ManyToOne
    @JoinColumn(name = "id_entidad", nullable = false)
    private EntidadesTransito entidad;

    @ManyToOne
    @JoinColumn(name = "usuario_desactiva_id", nullable = false)
    private Usuario usuarioDesactiva;


    @Column(name = "numero_tramite", nullable = false, unique = true, length = 30)
    private String numeroTramite;

    @Column(name = "documento_levantamiento", nullable = false, length = 255)
    private String documentoLevantamiento;

    @Column(name = "motivo_levantamiento", nullable = false, length = 255)
    private String motivoLevantamiento;

    @Column(name = "fecha_desactivacion", nullable = false)
    private LocalDateTime fechaDesactivacion;

    @Column(name = "estado", nullable = false, length = 20)
    private String estado;
}