package com.revisionvehicular.backend.entities.rtv;

import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "rtv_cambio_caracteristicas_vehiculo")
@Data
public class CambioCaracteristicasVehiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cambio_caracteristica")
    private Long idCambioCaracteristica;

    @ManyToOne
    @JoinColumn(name = "id_tramite", nullable = false)
    private TramiteMatriculacion tramite;

    @ManyToOne
    @JoinColumn(name = "vehiculo_id", nullable = false)
    private Vehiculo vehiculo;

    /** COLOR / MOTOR / CARROCERIA / TIPO / PASAJEROS / CAPACIDAD_CARGA / OTRO */
    @Column(name = "tipo_cambio", nullable = false, length = 50)
    private String tipoCambio;

    @Column(name = "detalle_anterior", length = 255)
    private String detalleAnterior;

    @Column(name = "detalle_nuevo", length = 255)
    private String detalleNuevo;

    /** Link al documento habilitante (certificado fabricante, factura, informe técnico, etc.) */
    @Column(name = "documento_soporte", length = 255)
    private String documentoSoporte;

    @Column(name = "fecha_cambio", nullable = false)
    private LocalDate fechaCambio;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    /** REGISTRADO / VALIDADO / APLICADO / ANULADO */
    @Column(name = "estado", nullable = false, length = 20)
    private String estado;
}

