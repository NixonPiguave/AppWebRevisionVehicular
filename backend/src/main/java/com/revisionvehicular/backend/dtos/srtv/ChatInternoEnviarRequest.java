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
    @Size(max = 2000)
    private String contenido;
}
