package com.revisionvehicular.backend.dtos.rtv;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class CrearInspeccionRequest {

    private Long vehiculoId;
    private Long metodoInspeccionId;
    private Long lineaId;
    private Long usuarioId;
    private String observaciones;
    private List<String> ubicacionesRevisadas;
    private List<Long> defectosIds;

    /** IDs de equipos utilizados (trazabilidad). */
    private List<Long> equiposIds;

    /** Valores medidos para gases/mecatrónica. Claves: CO, HC, LAMBDA, OPACIDAD, FRENOS_EFICACIA, etc. */
    private Map<String, Object> valoresMedidos;

    /** Kilometraje del vehículo al momento de la inspección (se guarda en valoresMedidos como KILOMETRAJE). */
    private Integer kilometraje;
}
