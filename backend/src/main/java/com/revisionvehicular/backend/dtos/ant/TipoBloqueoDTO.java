package com.revisionvehicular.backend.dtos.ant;

import lombok.Data;

@Data
public class TipoBloqueoDTO {

    private Long idTipoBloqueo;
    private String codigo;
    private String nombre;
    private String descripcion;
    private String docActivacion;
    private String docDesactivacion;
    private String instAutorizada;
    private String estado;
}
