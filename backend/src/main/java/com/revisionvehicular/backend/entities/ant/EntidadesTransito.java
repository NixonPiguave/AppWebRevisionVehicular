package com.revisionvehicular.backend.entities.ant;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "ant_entidad_transito")
@Data
public class EntidadesTransito {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_entidad")
    private Long idEntidad;

    @Column(name = "codigo", length = 10, nullable = false, unique = true)
    private String codigo;

    @Column(name = "nombre", length = 100, nullable = false)
    private String nombre;

    @Column(name = "nivel", length = 30)
    private String nivel;

    @Column(name = "descripcion", length = 255)
    private String descripcion;

    @Column(name = "estado", length = 20, nullable = false)
    private String estado;
}
