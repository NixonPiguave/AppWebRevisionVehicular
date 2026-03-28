package com.revisionvehicular.backend.dtos.srtv;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatInternoMensajeDTO {
    private Long mensajeId;
    private Long emisorId;
    private Long receptorId;
    private String contenido;
    private String tipo;
    /** Texto opcional bajo la imagen (solo IMAGEN). */
    private String leyenda;
    private LocalDateTime creadoEn;
    /** Momento en que el receptor marcó el mensaje como leído; para mensajes propios indica "visto". */
    private LocalDateTime leidoEn;
    /** Última edición (solo TEXTO). */
    private LocalDateTime editadoEn;
    /** Si responde a otro mensaje. */
    private Long respuestaAMensajeId;
    /** Extracto del mensaje citado (texto o [Foto]). */
    private String respuestaVistaPrevia;
    /** Tipo del mensaje citado. */
    private String respuestaTipo;
    /** true si lo envió el usuario de la sesión actual */
    private boolean enviadoPorMi;
}
