package com.revisionvehicular.backend.dtos.ant;

import lombok.Data;

@Data
public class EstadoMultaDTO {

    private Long idEstadoMulta;
    private String tipoMulta;
    private String descripcion;
    private String estado;
}
