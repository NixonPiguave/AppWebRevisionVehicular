package com.revisionvehicular.backend.entities.srtv;

import com.revisionvehicular.backend.service.rtv.MetodoInspeccionServiceImpl;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Table(name = "srtv_tipo_servicio")
@Data
public class Servicio {
    @jakarta.persistence.Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo_tramite")
    private Long idTipoTramite;

    @Column(name = "nombre", length = 100, nullable = false)
    private String nombre;

    @Column(name = "descripcion", length = 255)
    private String descripcion;

    @Column(name = "requiere_revision", nullable = false)
    private Boolean requiereRevision;

    @Column(name = "estado", length = 20, nullable = false)
    private String estado;

    @ManyToOne
    @JoinColumn(name = "metodo_pago_id")
    private MetodosPago metodosPago;
}