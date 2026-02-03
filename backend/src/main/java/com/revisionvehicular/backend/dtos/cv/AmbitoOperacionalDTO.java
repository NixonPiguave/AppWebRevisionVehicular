package com.revisionvehicular.backend.dtos.cv;

import lombok.Data;

@Data
public class AmbitoOperacionalDTO {
    private Long id;
    private String ambito;
    private String descripcion;
    private String estado;
}

