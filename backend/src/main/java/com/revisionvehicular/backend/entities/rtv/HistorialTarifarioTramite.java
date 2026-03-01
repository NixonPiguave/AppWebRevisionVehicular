package com.revisionvehicular.backend.entities.rtv;

import com.revisionvehicular.backend.entities.srtv.Usuario;
import com.revisionvehicular.backend.entities.ant.EntidadesTransito;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "rtv_historial_tarifario_tramite")
@Data
public class HistorialTarifarioTramite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tramite_historial")
    private Long idTramiteHistorial;

    @ManyToOne
    @JoinColumn(name = "id_tarifario_tramite", nullable = false)
    private TarifarioTramite tarifarioTramite;

    @ManyToOne
    @JoinColumn(name = "id_entidad_transito")
    private EntidadesTransito entidadesTransito;

    @Column(name = "fecha_vigencia", nullable = false)
    private LocalDate fechaVigencia;

    @Column(name = "fecha_vencimiento")
    private LocalDate fechaVencimiento;

    @Column(name = "tarifa", precision = 10, scale = 2, nullable = false)
    private BigDecimal tarifa;

    @Column(name = "estado", length = 20, nullable = false)
    private String estado;

    @Column(name = "motivo_cambio", length = 255)
    private String motivoCambio;
}