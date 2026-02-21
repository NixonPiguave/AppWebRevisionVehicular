package com.revisionvehicular.backend.entities.bund;

import com.revisionvehicular.backend.entities.ant.EntidadesTransito;
import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.rtv.TramiteMatriculacion;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "bund_incidente")
@Data
public class Incidente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_incidente")
    private Long idIncidente;

    @ManyToOne
    @JoinColumn(name = "id_tramite")
    private TramiteMatriculacion tramite;

    @ManyToOne
    @JoinColumn(name = "vehiculo_id")
    private Vehiculo vehiculo;

    @ManyToOne
    @JoinColumn(name = "usuario_reporta_id", nullable = false)
    private Usuario usuarioReporta;

    @ManyToOne
    @JoinColumn(name = "id_entidad", nullable = false)
    private EntidadesTransito entidad;

    @ManyToOne
    @JoinColumn(name = "usuario_resuelve_id")
    private Usuario usuarioResuelve;

    @Column(name = "numero_incidente", nullable = false, unique = true, length = 30)
    private String numeroIncidente;

    @Column(name = "tipo_incidente", nullable = false, length = 50)
    private String tipoIncidente;

    @Column(name = "descripcion", nullable = false, length = 255)
    private String descripcion;

    /** Link al documento soporte */
    @Column(name = "documentos_soporte", length = 255)
    private String documentosSoporte;

    @Column(name = "fecha_registro", nullable = false)
    private LocalDateTime fechaRegistro;

    @Column(name = "fecha_resolucion")
    private LocalDateTime fechaResolucion;

    @Column(name = "area_responsable", length = 100)
    private String areaResponsable;

    @Column(name = "resolucion", length = 255)
    private String resolucion;

    /** ABIERTO / EN_PROCESO / RESUELTO / NO_PROCEDE */
    @Column(name = "estado", nullable = false, length = 20)
    private String estado;
}
