package com.revisionvehicular.backend.entities.ant;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;


import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Table(name = "ant_estado_multa")
@Data
public class EstadoMulta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_estado_multa")
    private Long estadoMulta;

    @Column(name = "tipo_multa")
    private String tipoMulta;

    @Column(name="descripcion")
    private String descripcion;

    @Column(name="estado")
    private String estado;
}
