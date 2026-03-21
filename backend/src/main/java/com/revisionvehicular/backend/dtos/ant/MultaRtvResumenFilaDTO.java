package com.revisionvehicular.backend.dtos.ant;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MultaRtvResumenFilaDTO {

    private Long vehiculoId;
    private Long propietarioId;

    private String propietarioNombre;
    private String propietarioDocumento;

    private String vehiculoPlaca;
    private String vehiculoMarcaModelo;

    private BigDecimal recargoAcumulado;
}
