package com.revisionvehicular.backend.dtos.cv;

import lombok.Data;

@Data
public class CategoriaDTO {
    private Long categoriaid;
    private String codigo;
    private String nombre;
    private String descripcion;
    private String estado;
}
