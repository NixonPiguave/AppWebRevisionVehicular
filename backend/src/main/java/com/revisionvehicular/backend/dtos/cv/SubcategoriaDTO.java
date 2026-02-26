package com.revisionvehicular.backend.dtos.cv;
import lombok.Data;

@Data
public class SubcategoriaDTO {
    private Long id;
    private String codigoSubcategoria;
    private String nombre;
    private String descripcion;
    private Long categoriaId;
    private String estado;
}

