package com.revisionvehicular.backend.entities.rtv;

import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.sri.RegistroVehiculo;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "rtv_registro_base_unica_vehiculo")
@Data
public class RegistroBaseUnicaVehiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_registro_base_unica")
    private Long idRegistroBaseUnica;

    @ManyToOne
    @JoinColumn(name = "id_tramite", nullable = false)
    private TramiteMatriculacion tramite;

    @ManyToOne
    @JoinColumn(name = "vehiculo_id", nullable = false)
    private Vehiculo vehiculo;

    @ManyToOne
    @JoinColumn(name = "id_registro_sri")
    private RegistroVehiculo registroSri;

    /** NUEVO / IMPORTADO / REMATE / DONACION / ESTATAL / OTRO */
    @Column(name = "tipo_origen", nullable = false, length = 30)
    private String tipoOrigen;

    /** Link al documento de origen (factura, DAI, sentencia, acta de remate, etc.) */
    @Column(name = "documento_origen", length = 255)
    private String documentoOrigen;

    @Column(name = "fecha_registro", nullable = false)
    private LocalDate fechaRegistro;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    /** REGISTRADO / RECHAZADO / ANULADO */
    @Column(name = "estado", nullable = false, length = 20)
    private String estado;
}

