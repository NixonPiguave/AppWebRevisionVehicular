package com.revisionvehicular.backend.dtos.srtv;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PermisoDTO {
    private Long permisoId;
    private String codigo;
    private String nombre;
    private String modulo;
    private String estado;
    private String descripcion;
}