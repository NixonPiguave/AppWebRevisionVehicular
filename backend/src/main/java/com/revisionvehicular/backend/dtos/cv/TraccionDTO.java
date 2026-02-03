package com.revisionvehicular.backend.dtos.cv;

import lombok.Data;

@Data
public class TraccionDTO {
    private Long id;
    private String tipo;
    private String descripcion;
    private String estado;
}
