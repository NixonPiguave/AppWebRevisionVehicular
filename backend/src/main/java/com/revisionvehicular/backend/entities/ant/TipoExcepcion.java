package com.revisionvehicular.backend.entities.ant;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "ant_tipo_excepcion")
@Data
public class TipoExcepcion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo_excepcion")
    private Long idTipoExcepcion;

    @Column(name = "codigo", length = 50, nullable = false, unique = true)
    private String codigo;

    @Column(name = "descripcion", length = 300, nullable = false)
    private String descripcion;

    @Column(name = "estado", length = 20, nullable = false)
    private String estado;
}
