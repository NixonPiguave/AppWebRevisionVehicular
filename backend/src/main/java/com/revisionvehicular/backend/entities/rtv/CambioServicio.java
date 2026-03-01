package com.revisionvehicular.backend.entities.rtv;

import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "rtv_cambio_servicio")
@Data
public class CambioServicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cambio_servicio")
    private Long idCambioServicio;

    @ManyToOne
    @JoinColumn(name = "id_tramite", nullable = false)
    private TramiteMatriculacion tramite;

    @ManyToOne
    @JoinColumn(name = "vehiculo_id", nullable = false)
    private Vehiculo vehiculo;

    /** PARTICULAR / PUBLICO / COMERCIAL / ESTATAL / DIPLOMATICO / IT */
    @Column(name = "servicio_anterior", nullable = false, length = 30)
    private String servicioAnterior;

    /** PARTICULAR / PUBLICO / COMERCIAL / ESTATAL / DIPLOMATICO / IT */
    @Column(name = "servicio_nuevo", nullable = false, length = 30)
    private String servicioNuevo;

    @Column(name = "motivo_cambio", length = 255)
    private String motivoCambio;

    /** Link al documento habilitante (decreto, acuerdo, resolución, etc.) */
    @Column(name = "documento_soporte", length = 255)
    private String documentoSoporte;

    @Column(name = "fecha_cambio", nullable = false)
    private LocalDate fechaCambio;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    /** REGISTRADO / APLICADO / ANULADO */
    @Column(name = "estado", nullable = false, length = 20)
    private String estado;
}

