package com.revisionvehicular.backend.entities.pv;
import com.revisionvehicular.backend.entities.cv.Vehiculo;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pv_historial_propietario")
@Data
public class HistorialPropietario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_historial")
    private Long idHistorial ;
    @ManyToOne
    @JoinColumn(name = "vehiculo_id", nullable = false)
    private Vehiculo vehiculo;
    @ManyToOne
    @JoinColumn(name = "propietario_id", nullable = false)
    private Propietario propietario;
    @Column(name="fecha_inicio",nullable = false)
    private LocalDate fechaInicio;

    @Column(name="fecha_fin", nullable = false)
    private LocalDate fechaFin;

}
