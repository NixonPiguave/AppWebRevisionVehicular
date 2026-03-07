package com.revisionvehicular.backend.dtos.rtv;

import lombok.Data;

import java.util.List;

@Data
public class CrearInspeccionRequest {

    private Long vehiculoId;
    private Long metodoInspeccionId;
    private Long lineaId;
    private Long usuarioId;
    private String observaciones;
    private List<String> ubicacionesRevisadas;
    private List<Long> defectosIds;
}
