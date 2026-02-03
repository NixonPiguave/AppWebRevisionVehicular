package com.revisionvehicular.backend.entities.ant;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "ant_tipo_tramite")
@Data
public class TipoTramite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo_tramite")
    private Long idTipoTramite;

    @Column(name = "codigo", length = 50, nullable = false, unique = true)
    private String codigo;

    @Column(name = "nombre", length = 100, nullable = false)
    private String nombre;

    @Column(name = "descripcion", length = 300)
    private String descripcion;

    @Column(name = "estado", length = 20, nullable = false)
    private String estado;
}
