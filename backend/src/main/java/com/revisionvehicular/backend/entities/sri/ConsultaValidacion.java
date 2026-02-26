package com.revisionvehicular.backend.entities.sri;

import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.pv.Propietario;
import com.revisionvehicular.backend.entities.rtv.TramiteMatriculacion;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "sri_consulta_validacion")
@Data
public class ConsultaValidacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_consulta")
    private Long idConsulta;

    @ManyToOne
    @JoinColumn(name = "id_tramite", nullable = false)
    private TramiteMatriculacion tramite;

    @ManyToOne
    @JoinColumn(name = "vehiculo_id")
    private Vehiculo vehiculo;

    @ManyToOne
    @JoinColumn(name = "propietario_id")
    private Propietario propietario;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    /** IMPUESTO / REGISTRO / MULTA / PROPIETARIO */
    @Column(name = "tipo_consulta", nullable = false, length = 50)
    private String tipoConsulta;

    /** APROBADO / RECHAZADO / ERROR */
    @Column(name = "resultado", nullable = false, length = 20)
    private String resultado;

    @Column(name = "detalle_respuesta", length = 255)
    private String detalleRespuesta;

    @Column(name = "fecha_consulta", nullable = false)
    private LocalDate fechaConsulta;

    @Column(name = "estado", nullable = false, length = 20)
    private String estado;
}
