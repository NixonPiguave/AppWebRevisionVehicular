package com.revisionvehicular.backend.entities.rtv;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "rtv_recargo_calendarizacion")
@Data
public class RecargoCalendarizacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "clave", nullable = false, unique = true, length = 50)
    private String clave;

    @Column(name = "valor", nullable = false, length = 100)
    private String valor;

    @Column(name = "descripcion", length = 255)
    private String descripcion;

    @Column(name = "estado", length = 20)
    private String estado;
}
