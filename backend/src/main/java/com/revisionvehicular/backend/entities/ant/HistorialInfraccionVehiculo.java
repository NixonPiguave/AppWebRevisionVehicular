package com.revisionvehicular.backend.entities.ant;

import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.pv.Propietario;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "ant_historial_infraccion_vehiculo")
@Data
public class HistorialInfraccionVehiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_historial")
    private Long idHistorial;

    @ManyToOne
    @JoinColumn(name = "vehiculo_id", nullable = false)
    private Vehiculo vehiculo;

    @ManyToOne
    @JoinColumn(name = "id_multa", nullable = false)
    private Multa multa;

    /** Propietario al momento de la infracción (persiste aunque el vehículo cambie de dueño) */
    @ManyToOne
    @JoinColumn(name = "propietario_id", nullable = false)
    private Propietario propietario;

    /** Placa vigente al momento de la infracción */
    @Column(name = "placa_momento", length = 10)
    private String placaMomento;

    @Column(name = "estado_multa_momento", length = 50)
    private String estadoMultaMomento;

    @Column(name = "fecha_registro", nullable = false)
    private LocalDate fechaRegistro;

    @Column(name = "estado", nullable = false, length = 20)
    private String estado;
}
