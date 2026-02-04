package com.revisionvehicular.backend.entities.rtv;

import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.srtv.Empresa;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "rtv_impronta")
@Data
public class Impronta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long impronta_id;

    @Column(name = "fecha_registro", nullable = false)
    private LocalDateTime fechaRegistro;

    @Column(name = "CodigoImpronta")
    private String codigoImpronta;

    @Column(name = "Descripcion", length = 255)
    private String descripcion;

    @ManyToOne
    @JoinColumn(name = "vehiculo_id")
    private Vehiculo vehiculo;

    @ManyToOne
    @JoinColumn(name = "empresa_id")
    private Empresa empresa;
    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(length = 50)
    private String estado;
}