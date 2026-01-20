package com.revisionvehicular.backend.entities.ant;

import com.revisionvehicular.backend.entities.cv.Vehiculo;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "ant_deuda_vehicular")
@Data
public class DeudaVehicular {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_deuda")
    private Long idDeuda;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_vehiculo", nullable = false)
    private Vehiculo vehiculo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_entidad", nullable = false)
    private EntidadesTransito entidadesTransito;

    @Column(name = "tipo_deuda", length = 30, nullable = false)
    private String tipoDeuda;

    @Column(name = "periodo", nullable = false)
    private Integer periodo;

    @Column(name = "fecha_vencimiento", nullable = false)
    private LocalDate fechaVencimiento;

    @Column(name = "monto_original", precision = 10, scale = 2, nullable = false)
    private BigDecimal montoOriginal;

    @Column(name = "monto_recargo", precision = 10, scale = 2)
    private BigDecimal montoRecargo;

    @Column(name = "monto_total", precision = 10, scale = 2, nullable = false)
    private BigDecimal montoTotal;

    @Column(name = "monto_pendiente", precision = 10, scale = 2, nullable = false)
    private BigDecimal montoPendiente;

    @Column(name = "estado", length = 20, nullable = false)
    private String estado;

    @Column(name = "fecha_generacion", nullable = false)
    private LocalDate fechaGeneracion;
}
