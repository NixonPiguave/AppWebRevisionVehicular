package com.revisionvehicular.backend.dtos.srtv;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AuditoriaDTO {

    private Long auditoriaId;
    private String accion;
    private String tipoAccion;
    private String entidad;
    private String detalle;
    private LocalDateTime fecha;
    private Long usuarioId;
    private String nombreUsuario;
    private String nombreCompleto;
}
