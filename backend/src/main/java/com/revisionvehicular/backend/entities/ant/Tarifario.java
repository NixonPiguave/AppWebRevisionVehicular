package com.revisionvehicular.backend.entities.ant;

import com.revisionvehicular.backend.entities.cv.Categoria;
import com.revisionvehicular.backend.entities.cv.TipoMatricula;
import com.revisionvehicular.backend.entities.cv.TipoVehiculo;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.boot.model.naming.Identifier;

import java.math.BigDecimal;

@Entity
@Table(name = "ant_tarifario")
@Data
public class Tarifario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tarifario")
    private Long idTarifario;

    @Column(name = "valor", columnDefinition = "DECIMAL(10,2)")
    private BigDecimal valor;
    @Column(name = "estado", length = 50, nullable = false)
    private String estado;
    @ManyToOne
    @JoinColumn(name = "id_tipo_vehiculo", nullable = false)
    private TipoVehiculo tipoVehiculo;
    @ManyToOne
    @JoinColumn(name = "id_categoria", nullable = false)
    private Categoria categoria;
    @ManyToOne
    @JoinColumn(name = "id_tipo_matricula", nullable = false)
    private TipoMatricula tipoMatricula;
}
