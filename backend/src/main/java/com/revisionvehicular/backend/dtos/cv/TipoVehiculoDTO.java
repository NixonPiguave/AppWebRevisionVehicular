package com.revisionvehicular.backend.dtos.cv;

import lombok.Data;

@Data
public class TipoVehiculoDTO {
    private Long id;
    private String nombre;
    private String descripcion;
    private String estado;
    private Long claseId;
}

