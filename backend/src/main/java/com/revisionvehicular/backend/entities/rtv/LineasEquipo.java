package com.revisionvehicular.backend.entities.rtv;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Generated;

@Entity
@Table(name = "rtv_linea_equipo")
@Data
public class LineasEquipo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "linea_equipo_id")
    private Long idlineaEquipo;
    @ManyToOne
    @JoinColumn(name = "linea_id")
    private Lineas linea;
    @ManyToOne
    @JoinColumn(name = "equipo_id")
    private Equipos equipo;


}
