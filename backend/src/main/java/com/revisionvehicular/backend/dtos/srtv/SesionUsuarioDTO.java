package com.revisionvehicular.backend.dtos.srtv;

import lombok.Data;

import java.time.Instant;

@Data
public class SesionUsuarioDTO {
    private Long sesionId;
    private Long usuarioId;
    private String usuario;
    private String nombreCompleto;
    private String rol;
    private Instant fechaLogin;
    private Instant ultimaActividad;
}
