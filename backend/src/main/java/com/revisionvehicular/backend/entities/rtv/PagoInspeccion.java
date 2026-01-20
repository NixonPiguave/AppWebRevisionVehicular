package com.revisionvehicular.backend.entities.rtv;

import com.revisionvehicular.backend.entities.ant.Tarifario;
import com.revisionvehicular.backend.entities.pv.Propietario;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "rtv_pago_inspeccion")
@Data
public class PagoInspeccion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pago")
    private Long pagoid;

    @Column(name = "valor", nullable = false)
    private String valor;

    @Column(name="fecha_pago",nullable = false, length = 50)
    private LocalDateTime fechaPago;

    @Column(name="estado",length = 1)
    private String estado;

    @ManyToOne
    @JoinColumn(name = "tarifa_id", nullable = false)
    private Tarifario tarifario;
    @OneToOne
    @JoinColumn(name = "inspeccion_id", nullable = false)
    private Inspeccion inspeccion;
    @ManyToOne
    @JoinColumn(name = "Id_Propietario", nullable = false)
    private Propietario propietario;
}
