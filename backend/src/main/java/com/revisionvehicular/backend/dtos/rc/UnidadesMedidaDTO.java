package com.revisionvehicular.backend.dtos.rc;

import lombok.Data;

@Data
public class UnidadesMedidaDTO {

    private Long idUnidadMedida;

    private String nombre;
    private String simbolo;
    private String descripcion;

    private String estado;
}
