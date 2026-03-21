package com.revisionvehicular.backend.entities.srtv;

import com.revisionvehicular.backend.entities.rtv.TarifarioTramite;
import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "srtv_tipo_servicio")
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Servicio {

    @EqualsAndHashCode.Include
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo_tramite")
    private Long idTipoTramite;

    @Column(name = "nombre", length = 100, nullable = false)
    private String nombre;

    @Column(name = "descripcion", length = 255)
    private String descripcion;

    @Column(name = "genera_multa", length = 255, nullable = false)
    private String generaMulta;

    @Column(name = "requiere_revision", length = 255, nullable = false)
    private String requiereRevision;

    @Column(name = "estado", length = 20, nullable = false)
    private String estado;

    @ManyToOne
    @JoinColumn(name = "metodo_pago_id")
    private MetodosPago metodosPago;

    @OneToMany(mappedBy = "servicio", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<TarifarioTramite> tarifarios;

    @OneToMany(mappedBy = "servicio", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Turnos> turnos;
}