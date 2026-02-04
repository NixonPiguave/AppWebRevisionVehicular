package com.revisionvehicular.backend.dtos.ant;

import lombok.Data;

@Data
public class ExcepcionesDTO {

    private Long idEstadoExcepcion;
    private String codigo;
    private String descripcion;
    private String finaliza; // TEMPORAL / PERMANENTE
    private String estado;
}
