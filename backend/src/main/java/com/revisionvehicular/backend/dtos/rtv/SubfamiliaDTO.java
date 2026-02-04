package com.revisionvehicular.backend.dtos.rtv;

import lombok.Data;

@Data
public class SubfamiliaDTO {

    private Long id;
    private String nombre;
    private String descripcion;
    private String estado;

    private Long familiaId;
}
