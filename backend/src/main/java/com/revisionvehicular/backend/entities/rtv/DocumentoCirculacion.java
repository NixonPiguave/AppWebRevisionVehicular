package com.revisionvehicular.backend.entities.rtv;

import com.revisionvehicular.backend.entities.ant.EntidadesTransito;
import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "rtv_documento_circulacion")
@Data
public class DocumentoCirculacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_documento")
    private Long idDocumento;

    @ManyToOne
    @JoinColumn(name = "id_tramite", nullable = false)
    private TramiteMatriculacion tramite;

    @ManyToOne
    @JoinColumn(name = "id_matricula", nullable = false)
    private Matricula matricula;

    @ManyToOne
    @JoinColumn(name = "vehiculo_id", nullable = false)
    private Vehiculo vehiculo;

    @ManyToOne
    @JoinColumn(name = "entidad_emisora_id", nullable = false)
    private EntidadesTransito entidadEmisora;

    @ManyToOne
    @JoinColumn(name = "digitador_id", nullable = false)
    private Usuario digitador;

    @Column(name = "periodo", nullable = false)
    private Integer periodo;

    @Column(name = "fecha_emision", nullable = false)
    private LocalDate fechaEmision;

    @Column(name = "fecha_caducidad", nullable = false)
    private LocalDate fechaCaducidad;

    /** SI / NO */
    @Column(name = "es_duplicado", nullable = false, length = 255)
    private String esDuplicado;

    /** DETERIORO / PERDIDA / ROBO */
    @Column(name = "motivo_duplicado", length = 100)
    private String motivoDuplicado;

    /** VIGENTE / VENCIDO / ANULADO / DUPLICADO */
    @Column(name = "estado", nullable = false, length = 20)
    private String estado;
}
