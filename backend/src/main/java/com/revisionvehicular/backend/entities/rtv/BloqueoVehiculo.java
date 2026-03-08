package com.revisionvehicular.backend.entities.rtv;

import com.revisionvehicular.backend.entities.ant.EntidadesTransito;
import com.revisionvehicular.backend.entities.ant.TipoBloqueo;
import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Servicio 09 — Bloqueo de Vehículo
 * Base legal: Art.16(9) · Art.50 · Art.51 · Art.52
 *
 * BA / FA / RB / COBY / ROBO bloquean TODOS los procesos.
 * TDD solo bloquea transferencias.
 * RDD bloquea transferencias y casos especiales.
 * La institución que activa debe coincidir con inst_autorizada del catálogo.
 */
@Entity
@Table(name = "rtv_bloqueo_vehiculo_srv")
@Data
public class BloqueoVehiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_bloqueo_srv")
    private Long idBloqueoSrv;

    @ManyToOne
    @JoinColumn(name = "vehiculo_id", nullable = false)
    private Vehiculo vehiculo;

    @ManyToOne
    @JoinColumn(name = "id_entidad", nullable = false)
    private EntidadesTransito entidad;

    @ManyToOne
    @JoinColumn(name = "usuario_activa_id", nullable = false)
    private Usuario usuarioActiva;

    @Column(name = "numero_tramite", nullable = false, unique = true, length = 30)
    private String numeroTramite;

    @ManyToOne
    @JoinColumn(name = "tipo_bloqueo_id", nullable = false)
    private TipoBloqueo tipoBloqueo;

    @Column(name = "motivo", nullable = false, length = 255)
    private String motivo;

    @Column(name = "procesos_bloqueados", nullable = false, length = 50)
    private String procesosBloqueados;

    @Column(name = "documento_habilitante", nullable = false, length = 255)
    private String documentoHabilitante;

    @Column(name = "institucion_origen", nullable = false, length = 100)
    private String institucionOrigen;

    @Column(name = "fecha_activacion", nullable = false)
    private LocalDateTime fechaActivacion;

    @Column(name = "estado", nullable = false, length = 20)
    private String estado;

    @Column(name = "observaciones", length = 255)
    private String observaciones;
}