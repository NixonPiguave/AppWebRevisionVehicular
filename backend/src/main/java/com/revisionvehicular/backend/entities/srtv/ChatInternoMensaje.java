package com.revisionvehicular.backend.entities.srtv;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "srtv_chat_mensaje")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatInternoMensaje {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mensaje_id")
    private Long mensajeId;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "emisor_id", nullable = false)
    private Usuario emisor;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "receptor_id", nullable = false)
    private Usuario receptor;

    @Column(nullable = false, length = 2000)
    private String contenido;

    @Column(name = "creado_en", nullable = false)
    private LocalDateTime creadoEn;

    /** Cuando el receptor abrió/vió el mensaje; null = aún no leído por el destinatario. */
    @Column(name = "leido_en")
    private LocalDateTime leidoEn;
}
