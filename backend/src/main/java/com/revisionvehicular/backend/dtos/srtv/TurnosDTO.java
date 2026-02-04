package com.revisionvehicular.backend.dtos.srtv;

import lombok.Data;

@Data
public class TurnosDTO {

    private Integer turnoId;

    private Long propietarioId;
    private Long vehiculoId;

    private String estado;

    private Long servicioId;
}
