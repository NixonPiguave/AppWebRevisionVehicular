package com.revisionvehicular.backend.entities.srtv;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "srtv_rol_permiso_postgres")
public class RolPermisoPostgres {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rol_permiso_id")
    private Long rolPermisoId;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rol_id", nullable = false)
    private Rol rol;
    @Column(name = "nombre_rol_postgres", nullable = false, length = 50)
    private String nombreRolPostgres;
    @Column(name = "fecha_asignacion")
    private LocalDateTime fechaAsignacion = LocalDateTime.now();
}