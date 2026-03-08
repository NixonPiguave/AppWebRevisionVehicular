package com.revisionvehicular.backend.entities.srtv;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "srtv_opcion_menu")
public class OpcionMenu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "opcion_menu_id")
    private Long opcionMenuId;

    @Column(nullable = false, unique = true, length = 100)
    private String clave;

    @Column(name = "nombre_visible", length = 150)
    private String nombreVisible;

    @Column(length = 100)
    private String modulo;

    @Column(name = "orden")
    private Integer orden = 0;
}
