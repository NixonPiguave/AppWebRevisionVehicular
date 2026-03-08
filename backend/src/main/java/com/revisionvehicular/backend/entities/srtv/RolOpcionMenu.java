package com.revisionvehicular.backend.entities.srtv;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "srtv_rol_opcion_menu", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"rol_id", "opcion_menu_id"})
})
public class RolOpcionMenu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rol_opcion_menu_id")
    private Long rolOpcionMenuId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rol_id", nullable = false)
    private Rol rol;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "opcion_menu_id", nullable = false)
    private OpcionMenu opcionMenu;
}
