package com.revisionvehicular.backend.entities.ant;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "ant_tipo_bloqueo")
@Data
public class TipoBloqueo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo_bloqueo")
    private Long idTipoBloqueo;

    /** BA / FA / COBY / TDD / RDD / ROBO / PRENDA_COMERCIAL / PRENDA_INDUSTRIAL / etc. */
    @Column(name = "codigo", nullable = false, unique = true, length = 20)
    private String codigo;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "descripcion", length = 255)
    private String descripcion;

    @Column(name = "doc_activacion", length = 100)
    private String docActivacion;

    @Column(name = "doc_desactivacion", length = 100)
    private String docDesactivacion;

    @Column(name = "inst_autorizada", length = 100)
    private String instAutorizada;

    @Column(name = "estado", nullable = false, length = 20)
    private String estado;
}
