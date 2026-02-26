package com.revisionvehicular.backend.dtos.srtv;

import lombok.Data;

@Data
public class PermisoDTO {
    private Long permisoId;
    private String nombre;
    private String modulo;
    private String estado;
    private String descripcion;
}