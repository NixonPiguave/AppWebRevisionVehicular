package com.revisionvehicular.backend.entities.ant;

import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "ant_tramite_matriculacion")
@Data
public class TramiteMatriculacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tramite")
    private Long idTramite;

    @ManyToOne
    @JoinColumn(name = "id_vehiculo", nullable = false)
    private Vehiculo vehiculo;

    @ManyToOne
    @JoinColumn(name = "id_tipo_tramite", nullable = false)
    private TipoTramite tipoTramite;

    @ManyToOne
    @JoinColumn(name = "id_estado_tramite", nullable = false)
    private EstadoTramite estadoTramite;

    @Column(name = "periodo", nullable = false)
    private Integer periodo;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_cierre")
    private LocalDate fechaCierre;

    @ManyToOne
    @JoinColumn(name = "usuario_inicio", nullable = false)
    private Usuario usuarioInicio;

    @ManyToOne
    @JoinColumn(name = "usuario_cierre")
    private Usuario usuarioCierre;

    @Column(name = "observaciones", length = 500)
    private String observaciones;
}
