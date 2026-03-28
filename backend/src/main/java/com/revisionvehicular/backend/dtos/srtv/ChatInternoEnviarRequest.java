package com.revisionvehicular.backend.dtos.srtv;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChatInternoEnviarRequest {
    @NotNull
    private Long receptorId;

    @NotBlank
    @Size(max = 2048)
    private String contenido;

    /** Opcional: citar / responder un mensaje de esta conversación. */
    private Long respuestaAMensajeId;

    /** TEXTO (defecto) o IMAGEN ({@code contenido} = URL, p. ej. Cloudinary). */
    private String tipo;

    /** Texto opcional que acompaña a la imagen (solo aplica si tipo es IMAGEN). */
    @Size(max = 2048)
    private String leyenda;
}
