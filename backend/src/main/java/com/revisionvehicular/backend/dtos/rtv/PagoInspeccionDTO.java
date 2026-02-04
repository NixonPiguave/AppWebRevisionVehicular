package com.revisionvehicular.backend.dtos.rtv;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PagoInspeccionDTO {

    private Long id;
    private String valor;
    private LocalDateTime fechaPago;
    private String estado;

    private Long tarifarioId;
    private Long inspeccionId;
    private Long propietarioId;
}
