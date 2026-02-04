package com.revisionvehicular.backend.dtos.rtv;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class InspeccionDTO {

    private Long id;
    private LocalDateTime fechaInspeccion;
    private String resultado;
    private String observaciones;
    private String estado;

    private Long vehiculoId;
    private Long metodoInspeccionId;
    private Long lineaId;
    private Long usuarioId;
    private Long calendarizacionId;

    private List<DetalleInspeccionDTO> detalles;
}
