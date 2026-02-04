package com.revisionvehicular.backend.dtos.rtv;

import lombok.Data;

@Data
public class DetalleInspeccionDTO {

    private Long id;
    private Long inspeccionId;
    private Long defectoId;
    private String observacion;
    private String estado;

    private Long umbralId;
    private Long metodoInspeccionId;
}
