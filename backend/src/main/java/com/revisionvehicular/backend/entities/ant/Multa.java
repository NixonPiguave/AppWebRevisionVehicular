package com.revisionvehicular.backend.entities.ant;

import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.pv.Propietario;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "ant_multa")
@Data
public class Multa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_multa")
    private Long idMulta;

    @ManyToOne
    @JoinColumn(name = "id_entidad", nullable = false)
    private EntidadesTransito entidadTransito;

    @ManyToOne
    @JoinColumn(name = "id_propietario", nullable = false)
    private Propietario propietario;

    @ManyToOne
    @JoinColumn(name = "id_vehiculo")
    private Vehiculo vehiculo;
    @ManyToOne
    @JoinColumn(name = "id_estado_multa")
    private EstadoMulta estadoMulta;

    @Column(name = "numero_citacion", length = 50)
    private String numeroCitacion;

    @Column(name = "fecha_emision", nullable = false)
    private LocalDateTime fechaEmision;

    @Column(name = "fecha_Notificacion", nullable = false)
    private LocalDateTime fechaNotificacion;

    @Column(name = "origen_Multa", nullable = false)
    private String origenMulta;

    @Column(name = "pais",length = 255, nullable = false)
    private String pais;

    @Column(name = "ciudad",length = 255, nullable = false)
    private String ciudad;

    @Column(name = "puntos",length = 255, nullable = false)
    private String puntos;

    @Column(name = "motivo", length = 255, nullable = false)
    private String motivo;

    @Column(name = "monto", precision = 10, scale = 2, nullable = false)
    private BigDecimal monto;

    @Column(name = "estado", length = 20, nullable = false)
    private String estado;
}
