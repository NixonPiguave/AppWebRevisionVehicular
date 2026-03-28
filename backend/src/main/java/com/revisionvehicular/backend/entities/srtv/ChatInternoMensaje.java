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

    /** Mensaje citado (responde a). Misma conversación (validado al guardar). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "respuesta_a_id")
    private ChatInternoMensaje respuestaA;

    @Column(nullable = false, length = 2048)
    private String contenido;

    /** TEXTO o IMAGEN (URL de imagen en contenido). */
    @Column(nullable = false, length = 20)
    private String tipo = "TEXTO";

    /** Pie de foto / texto junto a la imagen (solo tipo IMAGEN). */
    @Column(length = 2048)
    private String leyenda;

    @Column(name = "creado_en", nullable = false)
    private LocalDateTime creadoEn;

    /** Última edición del texto (solo aplica a tipo TEXTO). */
    @Column(name = "editado_en")
    private LocalDateTime editadoEn;

    /** Cuando el receptor abrió/vió el mensaje; null = aún no leído por el destinatario. */
    @Column(name = "leido_en")
    private LocalDateTime leidoEn;
}
