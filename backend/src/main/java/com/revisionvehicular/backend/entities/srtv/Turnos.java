package com.revisionvehicular.backend.entities.srtv;

import com.revisionvehicular.backend.entities.ant.EntidadesTransito;
import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.pv.Propietario;
import com.revisionvehicular.backend.entities.rtv.TramiteMatriculacion;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.math.BigDecimal;

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

    @ManyToOne
    @JoinColumn(name = "id_tramite")
    private TramiteMatriculacion tramite;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDate fechaFin;

    @Column(name = "fecha_cancelado")
    private LocalDate fechaCancelado;

    @Column(name = "estado", length = 35)
    private String estado;

    @Column(name = "monto_pagado")
    private BigDecimal montoPagado;

    @Column(name = "fecha_pagado")
    private LocalDate fechaPagado;

    @Column(name = "validador", length = 64)
    private String validador;
}