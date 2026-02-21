package com.revisionvehicular.backend.entities.ant;

import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.pv.Propietario;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "ant_exoneracion_multa_cal")
@Data
public class ExoneracionMultaCal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_exoneracion_cal")
    private Long idExoneracionCal;

    @ManyToOne
    @JoinColumn(name = "vehiculo_id", nullable = false)
    private Vehiculo vehiculo;

    @ManyToOne
    @JoinColumn(name = "propietario_id", nullable = false)
    private Propietario propietario;

    @ManyToOne
    @JoinColumn(name = "id_entidad", nullable = false)
    private EntidadesTransito entidadTransito;

    @ManyToOne
    @JoinColumn(name = "usuario_aprueba_id", nullable = false)
    private Usuario usuarioAprueba;

    /**
     Art. 14 - Causales:
     TALLER_MECANICO   → vehículo en taller por accidente o daño
     ROBO_VEHICULO     → vehículo robado con bloqueo activo en BUND
     PROCESO_JUDICIAL  → vehículo dentro de proceso judicial
     SECTOR_PUBLICO    → institución pública (ver subcausal)
     PROBLEMA_ENTIDAD  → fallo en el GAD que impidió el servicio
     FUERZA_MAYOR      → caso fortuito o fuerza mayor
     */
    @Column(name = "causal", nullable = false, length = 50)
    private String causal;

    /**
     Subcausales de SECTOR_PUBLICO (Art. 14(4)):
     ENTREGA_INTERINSTITUCIONAL / RETRASO_MIN_FINANZAS / INCAUTACION_JUDICIAL
     */
    @Column(name = "subcausal", length = 100)
    private String subcausal;

    @Column(name = "descripcion_causal", nullable = false, length = 255)
    private String descripcionCausal;

    /** Link según causal: factura taller / denuncia robo / doc. judicial / CUR */
    @Column(name = "documento_soporte", length = 255)
    private String documentoSoporte;

    /** Link: informe técnico para causales PROBLEMA_ENTIDAD y FUERZA_MAYOR */
    @Column(name = "informe_tecnico", length = 255)
    private String informeTecnico;

    @Column(name = "fecha_solicitud", nullable = false)
    private LocalDate fechaSolicitud;

    @Column(name = "fecha_resolucion")
    private LocalDate fechaResolucion;

    @Column(name = "periodo_exonerado", nullable = false)
    private Integer periodoExonerado;

    /** Meses exonerados separados por coma, ej: "3,4,5" */
    @Column(name = "meses_exonerados", length = 50)
    private String mesesExonerados;

    /** SOLICITADA / APROBADA / RECHAZADA */
    @Column(name = "estado", nullable = false, length = 20)
    private String estado;
}
