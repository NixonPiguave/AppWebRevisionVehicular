package com.revisionvehicular.backend.entities.rtv;

import jakarta.persistence.*;
import lombok.Data;
import com.revisionvehicular.backend.entities.rc.Umbral;

@Entity
@Table(name = "rtv_detalle_inspeccion")
@Data
public class DetalleInspeccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long detalle_inspeccion_id;

    @ManyToOne
    @JoinColumn(name = "inspeccion_id", nullable = false)
    private Inspeccion inspeccion;

    @ManyToOne
    @JoinColumn(name = "defecto_id", nullable = false)
    private Defecto defecto;

    @Column(length = 500)
    private String observacion;

    @Column(nullable = false, length = 50)
    private String estado;

    @ManyToOne
    @JoinColumn(name = "umbral_id", nullable = false)
    private Umbral umbral;

    @ManyToOne
    @JoinColumn(name = "metodo_inspeccion_id", nullable = false)
    private MetodoInspeccion  metodoInspeccion;
}