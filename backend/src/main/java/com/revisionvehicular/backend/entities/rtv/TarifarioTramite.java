package com.revisionvehicular.backend.entities.rtv;

import com.revisionvehicular.backend.entities.cv.Categoria;
import com.revisionvehicular.backend.entities.srtv.Servicio;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/** Tarifas por tipo de trámite; opcionalmente por categoría de vehículo (unicidad parcial en BD). */
@Entity
@Table(
        name = "rtv_tarifario_tramite",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "rtv_tarifario_tramite_codificacion_key",
                        columnNames = "codificacion"
                )
        }
)
@Data
public class TarifarioTramite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tarifario_tramite")
    private Long idTarifarioTramite;

    @ManyToOne
    @JoinColumn(name = "id_tipo_tramite", nullable = false)
    private Servicio servicio;

    /** Si no es null, esta tarifa aplica solo a esa categoría de vehículo (cv_categoria). */
    @ManyToOne
    @JoinColumn(name = "id_categoria")
    private Categoria categoria;

    @Column(name = "codificacion", length = 30, nullable = false, unique = true)
    private String codificacion;

    @Column(name = "nombre_tramite", length = 100, nullable = false)
    private String nombreTramite;

    @Column(name = "descripcion", length = 255)
    private String descripcion;

    @Column(name = "direccion_duena_proceso", length = 100, nullable = false)
    private String direccionDuenaProceso;

    @Column(name = "tarifa", precision = 10, scale = 2, nullable = false)
    private BigDecimal tarifa;

    @Column(name = "periodo", nullable = false)
    private Integer periodo;

    @Column(name = "estado", length = 20, nullable = false)
    private String estado;

    @OneToMany(mappedBy = "tarifarioTramite", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<HistorialTarifarioTramite> historial;
}