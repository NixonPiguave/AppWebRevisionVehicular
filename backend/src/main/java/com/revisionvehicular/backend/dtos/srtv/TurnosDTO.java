package com.revisionvehicular.backend.dtos.srtv;

import lombok.Data;
import java.time.LocalDate;

@Data
public class TurnosDTO {
    private Long turnoId;
    private Long propietarioId;
    private Long vehiculoId;
    private Long servicioId;
    private Long tramiteId;
    private Long entidadId;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private LocalDate fechaCancelado;
    private String estado;
}