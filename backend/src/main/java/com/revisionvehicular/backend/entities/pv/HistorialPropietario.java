package com.revisionvehicular.backend.entities.pv;
import com.revisionvehicular.backend.entities.cv.Vehiculo;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pv_historial_propietario")
@Data
public class HistorialPropietario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id_Historial")
    private Long idHistorial ;

    @ManyToOne
    @JoinColumn(name = "vehiculo_id", nullable = false)
    private Vehiculo vehiculo;

    @OneToMany(mappedBy = "propietario", cascade = CascadeType.ALL)
    private List<Propietario> propietario = new ArrayList<>();

    @Column(nullable = false)
    private LocalDateTime fechaInicio;

    @Column(nullable = false)
    private LocalDateTime fechaFin;

}
