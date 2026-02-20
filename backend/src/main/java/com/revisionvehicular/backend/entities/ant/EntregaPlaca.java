package com.revisionvehicular.backend.entities.ant;

import com.revisionvehicular.backend.entities.pv.Propietario;
import com.revisionvehicular.backend.entities.rtv.TramiteMatriculacion;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "ant_entrega_placa")
@Data
public class EntregaPlaca {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_entrega")
    private Long idEntrega;

    @ManyToOne
    @JoinColumn(name = "id_placa", nullable = false)
    private Placa placa;

    @ManyToOne
    @JoinColumn(name = "id_tramite", nullable = false)
    private TramiteMatriculacion tramite;

    @ManyToOne
    @JoinColumn(name = "propietario_id", nullable = false)
    private Propietario propietario;

    @ManyToOne
    @JoinColumn(name = "usuario_entrega_id", nullable = false)
    private Usuario usuarioEntrega;

    @Column(name = "fecha_entrega", nullable = false)
    private LocalDateTime fechaEntrega;

    /** SI / NO */
    @Column(name = "firmado_usuario", nullable = false, length = 255)
    private String firmadoUsuario;

    /** Link al acta firmada y digitalizada */
    @Column(name = "documento_digitalizado", length = 255)
    private String documentoDigitalizado;

    /** NUEVA / DUPLICADO / REEMPLAZO / DEVOLUCION */
    @Column(name = "tipo_operacion", nullable = false, length = 30)
    private String tipoOperacion;

    @Column(name = "estado", nullable = false, length = 20)
    private String estado;
}
