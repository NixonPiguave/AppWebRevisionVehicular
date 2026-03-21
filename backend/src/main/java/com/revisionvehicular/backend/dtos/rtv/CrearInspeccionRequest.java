package com.revisionvehicular.backend.dtos.rtv;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class CrearInspeccionRequest {

    @NotNull(message = "El vehículo es obligatorio")
    private Long vehiculoId;

    @NotNull(message = "El método de inspección es obligatorio")
    private Long metodoInspeccionId;

    private Long lineaId;

    @NotNull(message = "El usuario es obligatorio")
    private Long usuarioId;
    private String observaciones;
    private List<String> ubicacionesRevisadas;
    private List<Long> defectosIds;

    /** IDs de equipos utilizados (trazabilidad). */
    private List<Long> equiposIds;

    /** Valores medidos para gases/mecatrónica. Claves: CO, HC, LAMBDA, OPACIDAD, FRENOS_EFICACIA, etc. */
    private Map<String, Object> valoresMedidos;

    /** Kilometraje del vehículo al momento de la inspección (se guarda en valoresMedidos como KILOMETRAJE). */
    @Min(value = 0, message = "El kilometraje no puede ser negativo")
    private Integer kilometraje;
}
