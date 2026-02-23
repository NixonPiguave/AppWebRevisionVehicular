package com.revisionvehicular.backend.entities.srtv;

import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.pv.Propietario;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "rtv_turnos")
@Data
public class Turnos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "turno_id")
    private Long turnoId;

    @ManyToOne
    @JoinColumn(name = "propietario_id")
    private Propietario propietario;

    @ManyToOne
    @JoinColumn(name = "vehiculo_id")
    private Vehiculo vehiculo;

    @ManyToOne
    @JoinColumn(name = "id_tipo_tramite", nullable = false)
    private Servicio servicio;

    @Column(name = "estado", length = 35)
    private String estado;
}