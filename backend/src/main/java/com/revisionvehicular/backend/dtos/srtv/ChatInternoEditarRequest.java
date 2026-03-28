package com.revisionvehicular.backend.dtos.srtv;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChatInternoEditarRequest {
    @NotBlank
    @Size(max = 2048)
    private String contenido;
}
