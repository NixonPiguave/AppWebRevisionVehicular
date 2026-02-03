package com.revisionvehicular.backend.entities.ant;

import com.revisionvehicular.backend.entities.srtv.Usuario;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "ant_excepcion_tramite")
@Data
public class ExcepcionTramite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_excepcion_tramite")
    private Long idExcepcionTramite;

    @ManyToOne
    @JoinColumn(name = "id_tramite", nullable = false)
    private TramiteMatriculacion tramite;

    @ManyToOne
    @JoinColumn(name = "id_tipo_excepcion", nullable = false)
    private TipoExcepcion tipoExcepcion;

    @ManyToOne
    @JoinColumn(name = "id_estado_excepcion", nullable = false)
    private EstadoExcepcion estadoExcepcion;

    @Column(name = "articulo_legal", length = 50, nullable = false)
    private String articuloLegal;

    @Column(name = "descripcion", length = 500)
    private String descripcion;

    @Column(name = "documento_respaldo", length = 200)
    private String documentoRespaldo;

    @Column(name = "fecha_solicitud", nullable = false)
    private LocalDate fechaSolicitud;

    @Column(name = "fecha_resolucion")
    private LocalDate fechaResolucion;

    @ManyToOne
    @JoinColumn(name = "usuario_resolutor")
    private Usuario usuarioResolutor;
}
