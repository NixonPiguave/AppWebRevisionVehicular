package com.revisionvehicular.backend.dtos.cv;

import lombok.Data;

@Data
public class ModeloVehiculoDTO {

    private Long id;
    private String nombre;
    private Integer anioDesde;
    private Integer anioHasta;
    private String estado;

    private Long marcaId;
}
