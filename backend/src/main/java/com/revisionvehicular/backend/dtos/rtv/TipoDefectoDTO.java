package com.revisionvehicular.backend.dtos.rtv;

import lombok.Data;

@Data
public class TipoDefectoDTO {

    private Long id;
    private String codigo;
    private String nombre;
    private String descripcion;
    private String estado;
}
