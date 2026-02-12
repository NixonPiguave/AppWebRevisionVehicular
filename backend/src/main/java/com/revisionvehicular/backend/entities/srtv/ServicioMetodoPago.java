package com.revisionvehicular.backend.entities.srtv;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "srtv_servicio_metodo_pago")
@Data
public class ServicioMetodoPago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_tipo_tramite", nullable = false)
    private Servicio servicio;

    @ManyToOne
    @JoinColumn(name = "metodo_pago_id", nullable = false)
    private MetodosPago metodoPago;
}
