package com.revisionvehicular.backend.entities.rtv;

import com.revisionvehicular.backend.entities.ant.EntidadesTransito;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "rtv_anulacion_tramite")
@Data
public class AnulacionTramite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_anulacion")
    private Long idAnulacion;

    @ManyToOne
    @JoinColumn(name = "id_tramite", nullable = false)
    private TramiteMatriculacion tramite;

    @ManyToOne
    @JoinColumn(name = "id_entidad", nullable = false)
    private EntidadesTransito entidad;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "motivo_anulacion", nullable = false, length = 255)
    private String motivoAnulacion;

    /** Link al documento soporte */
    @Column(name = "documentos_soporte", length = 255)
    private String documentosSoporte;

    @Column(name = "fecha_anulacion", nullable = false)
    private LocalDateTime fechaAnulacion;

    @Column(name = "transacciones_reversadas", length = 255)
    private String transaccionesReversadas;

    @Column(name = "estado", nullable = false, length = 20)
    private String estado;
}
