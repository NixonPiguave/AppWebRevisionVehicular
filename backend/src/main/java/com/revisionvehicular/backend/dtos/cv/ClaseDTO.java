package com.revisionvehicular.backend.dtos.cv;

import lombok.Data;

@Data
public class ClaseDTO {
    private Long id;
    private String clase;
    private String descripcion;
    private String estado;
}
