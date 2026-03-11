package com.revisionvehicular.backend.dtos.rtv;

import lombok.Data;

@Data
public class DefectoDTO {

    private Long id;
    private String codigo;
    private String descripcion;
    private String estado;
    private String puntoDeTrabajo;
    private String maquinaria;
    private String procedimientos;
    private String descripciontipo;
    private String observaciones;

    private Long tipoDefectoId;
    private Long subfamiliaId;
    private Long categoriaId;
    private String nombreSubfamilia;
}
