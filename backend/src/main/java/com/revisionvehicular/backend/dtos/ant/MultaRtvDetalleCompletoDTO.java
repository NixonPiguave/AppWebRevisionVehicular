package com.revisionvehicular.backend.dtos.ant;

import lombok.Data;

import java.util.List;

@Data
public class MultaRtvDetalleCompletoDTO {

    private Long vehiculoId;
    private String placa;
    private Long propietarioId;
    private String propietarioDocumento;
    private String propietarioNombre;
    private List<MultaRtvDetalleLineaDTO> multas;
}
