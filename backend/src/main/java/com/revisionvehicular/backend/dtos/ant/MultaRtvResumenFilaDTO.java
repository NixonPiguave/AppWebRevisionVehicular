package com.revisionvehicular.backend.dtos.ant;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class MultaRtvResumenFilaDTO {

    private Long vehiculoId;
    private Long propietarioId;
    private BigDecimal recargoAcumulado;
}
