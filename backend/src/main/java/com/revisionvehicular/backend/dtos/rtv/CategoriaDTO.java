package com.revisionvehicular.backend.dtos.rtv;

import lombok.Data;

@Data
public class CategoriaDTO {

    private Long id;
    private String codigo;
    private String nombre;
    private String descripcion;
    private String estado;

    private Long subfamiliaId;
}
