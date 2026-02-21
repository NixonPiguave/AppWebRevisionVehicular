package com.revisionvehicular.backend.entities.sri;

import com.revisionvehicular.backend.entities.cv.Vehiculo;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "sri_registro_vehiculo")
@Data
public class RegistroVehiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_sri_registro")
    private Long idSriRegistro;

    @ManyToOne
    @JoinColumn(name = "vehiculo_id", nullable = false)
    private Vehiculo vehiculo;

    @Column(name = "numero_ramv", length = 50)
    private String numeroRamv;

    @Column(name = "numero_cpn", length = 50)
    private String numeroCpn;

    @Column(name = "avaluo_comercial", precision = 12, scale = 2)
    private BigDecimal avaluoComercial;

    @Column(name = "fecha_registro_sri", nullable = false)
    private LocalDate fechaRegistroSri;

    @Column(name = "fecha_actualizacion")
    private LocalDate fechaActualizacion;

    /** HABILITADO / DESHABILITADO / BAJA */
    @Column(name = "estado_sri", nullable = false, length = 30)
    private String estadoSri;

    /** NUEVO / IMPORTADO / REMATE / DONACION / etc. */
    @Column(name = "tipo_registro", nullable = false, length = 30)
    private String tipoRegistro;

    @Column(name = "observacion", length = 255)
    private String observacion;

    @Column(name = "estado", nullable = false, length = 20)
    private String estado;
}
