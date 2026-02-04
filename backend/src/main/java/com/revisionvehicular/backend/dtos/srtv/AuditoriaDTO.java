package com.revisionvehicular.backend.dtos.srtv;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AuditoriaDTO {

    private Long auditoriaId;
    private String accion;
    private LocalDateTime fecha;

    private Long usuarioId;
}
