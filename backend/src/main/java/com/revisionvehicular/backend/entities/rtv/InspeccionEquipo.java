package com.revisionvehicular.backend.entities.rtv;

import jakarta.persistence.*;
import lombok.Data;

/**
 * Trazabilidad: equipos utilizados en cada inspección.
 * Una inspección puede usar varios equipos (analizador gases, banco frenos, etc.).
 */
@Entity
@Table(name = "rtv_inspeccion_equipo", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"inspeccion_id", "equipo_id"})
})
@Data
public class InspeccionEquipo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "inspeccion_equipo_id")
    private Long inspeccionEquipoId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inspeccion_id", nullable = false)
    private Inspeccion inspeccion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipo_id", nullable = false)
    private Equipos equipo;
}
