package com.revisionvehicular.backend.entities.srtv;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "srtv_auditoria")
public class Auditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long auditoria_id;

    @Column(nullable = false)
    private String accion;

    @Column(nullable = false)
    private LocalDateTime fecha;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
}
