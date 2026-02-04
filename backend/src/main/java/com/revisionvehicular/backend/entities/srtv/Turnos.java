package com.revisionvehicular.backend.entities.srtv;

import com.revisionvehicular.backend.entities.pv.Propietario;
import com.revisionvehicular.backend.entities.cv.Vehiculo;
import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.annotation.Id;

@Table(name = "rtv_turnos")
@Data
public class Turnos {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer turno_id;

    @ManyToOne
    @JoinColumn(name = "propietario_id")
    private Propietario propietario;

    @ManyToOne
    @JoinColumn(name = "vehiculo_id")
    private Vehiculo vehiculo;


    @Column(name = "Estado", length = 35)
    private String estado;

    @ManyToOne
    @JoinColumn(name = "id_tipo_tramite")
    private Servicio servicio;
}
