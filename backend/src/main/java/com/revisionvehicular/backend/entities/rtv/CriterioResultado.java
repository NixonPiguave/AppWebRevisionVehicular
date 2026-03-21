package com.revisionvehicular.backend.entities.rtv;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Configuración de criterios para aprobar/rechazar inspecciones RTV.
 * Define qué tipos de defectos (1, 2, 3) causan RECHAZADO.
 */
@Entity
@Table(name = "rtv_criterio_resultado")
@Data
public class CriterioResultado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "criterio_id")
    private Long criterioId;

    @Column(name = "tipo1_rechaza", nullable = false)
    private Boolean tipo1Rechaza = false;

    @Column(name = "tipo2_rechaza", nullable = false)
    private Boolean tipo2Rechaza = true;

    @Column(name = "tipo3_rechaza", nullable = false)
    private Boolean tipo3Rechaza = true;

    /** Cantidad máxima permitida. Si total > max, RECHAZADO. null = no aplicar (cuando rechaza=false). 0 = cualquier cantidad causa rechazo. */
    @Column(name = "tipo1_max")
    private Integer tipo1Max;

    @Column(name = "tipo2_max")
    private Integer tipo2Max;

    @Column(name = "tipo3_max")
    private Integer tipo3Max;

    @Column(name = "descripcion", length = 255)
    private String descripcion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @PrePersist
    @PreUpdate
    public void actualizarFecha() {
        this.fechaActualizacion = LocalDateTime.now();
    }
}
