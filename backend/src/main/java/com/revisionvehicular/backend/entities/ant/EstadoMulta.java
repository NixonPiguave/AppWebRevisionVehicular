package com.revisionvehicular.backend.entities.ant;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;


import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "ant_estado_multa")
@Data
public class EstadoMulta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_EstadoMulta")
    private Long estadoMulta;

    @Column(name = "TipoMulta")
    private String tipoMulta;

    @Column(name="Descripcion")
    private String descripcion;

    @Column(name="Estado")
    private String estado;
}
