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
@Table(name = "srtv_auditoria")
public class Auditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "auditoria_id")
    private Long auditoriaId;

    @Column(nullable = false, length = 500)
    private String accion;

    @Column(name = "tipo_accion", length = 20)
    private String tipoAccion; // INSERT, UPDATE, DELETE, INICIO_SESION, CIERRE_SESION

    @Column(name = "entidad", length = 100)
    private String entidad; // Ej: Usuario, Marca, Rol, Área

    @Column(name = "detalle", length = 1000)
    private String detalle; // Descripción legible del cambio

    @Column(nullable = false)
    private LocalDateTime fecha;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
}
