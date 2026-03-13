package com.revisionvehicular.backend.entities.srtv;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "srtv_sesion_usuario")
public class SesionUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sesion_id")
    private Long sesionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "fecha_login", nullable = false)
    private Instant fechaLogin;

    @Column(name = "ultima_actividad", nullable = false)
    private Instant ultimaActividad;

    @Column(nullable = false)
    private Boolean activo = true;
}
