package com.revisionvehicular.backend.entities.rtv;

import com.revisionvehicular.backend.entities.ant.Tarifario;
import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "rtv_pago")
@Data
public class Pago {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pago")
    private Long pagoid;

    @Column(name = "valor", nullable = false)
    private String valor;

    @Column(name="fecha_pago",nullable = false, length = 50)
    private LocalDateTime fechaPago;

    @Column(name="estado",length = 50)
    private String estado;

    @ManyToOne
    @JoinColumn(name = "tarifa_id", nullable = false)
    private Tarifario tarifario;
    @OneToOne
    @JoinColumn(name = "inspeccion_id", nullable = false)
    private Inspeccion inspeccion;
    @OneToOne
    @JoinColumn(name = "idusuario_recibe_pago", nullable = false)
    private Usuario usuario;
}
