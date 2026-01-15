package com.revisionvehicular.backend.entities.rtv;

import jakarta.persistence.*;
import lombok.Data;
import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rtv_inspeccion")
@Data
public class Inspeccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long inspeccion_id;

    @Column(name = "fecha_inspeccion", nullable = false)
    private LocalDateTime fechaInspeccion;

    @Column(nullable = false, length = 50)
    private String resultado;

    @Column(length = 500)
    private String observaciones;

    @ManyToOne
    @JoinColumn(name = "vehiculo_id", nullable = false)
    private Vehiculo vehiculo;

    @ManyToOne
    @JoinColumn(name = "metodo_inspeccion_id", nullable = false)
    private MetodoInspeccion metodoInspeccion;

    @ManyToOne
    @JoinColumn(name = "categoria_id")
    private RTV_Categoria categoria;

    @ManyToOne
    @JoinColumn(name = "linea_id")
    private Lineas linea;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @OneToMany(mappedBy = "inspeccion", cascade = CascadeType.ALL)
    private List<DetalleInspeccion> detalles = new ArrayList<>();

    @Column(length = 50)
    private String estado;
}