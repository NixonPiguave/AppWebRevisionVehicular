package com.revisionvehicular.backend.dtos.cv;

import lombok.Data;

@Data
public class TipoCombustibleDTO {
    private Long Id;
    private String nombre;
    private String descripcion;
    private String estado;
}
