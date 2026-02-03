package com.revisionvehicular.backend.entities.ant;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "ant_estado_tramite")
@Data
public class EstadoTramite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_estado_tramite")
    private Long idEstadoTramite;

    @Column(name = "codigo", length = 50, nullable = false, unique = true)
    private String codigo;

    @Column(name = "nombre", length = 100, nullable = false)
    private String nombre;

    @Column(name = "finaliza_tramite", nullable = false)
    private Boolean finalizaTramite;

    @Column(name = "estado", length = 20, nullable = false)
    private String estado;
}
