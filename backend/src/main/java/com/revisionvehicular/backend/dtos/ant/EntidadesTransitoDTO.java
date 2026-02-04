package com.revisionvehicular.backend.dtos.ant;

import lombok.Data;

@Data
public class EntidadesTransitoDTO {

    private Long idEntidad;
    private String codigo;
    private String nombre;
    private String nivel;
    private String descripcion;
    private String estado;
}
