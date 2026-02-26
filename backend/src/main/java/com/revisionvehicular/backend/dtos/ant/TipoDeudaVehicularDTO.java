package com.revisionvehicular.backend.dtos.ant;

import lombok.Data;

@Data
public class TipoDeudaVehicularDTO {

    private Long idTipoDeuda;
    private String codigo;
    private String nombre;
    private String descripcion;
    private String estado;
}
