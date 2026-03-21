package com.revisionvehicular.backend.dtos.cv;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CapCargaDTO {
    private Long id;

    @NotNull(message = "La capacidad es obligatoria")
    @DecimalMin(value = "0.01", message = "La capacidad debe ser mayor a cero")
    private BigDecimal capacidad;
    private String unidad;
    private String descripcion;
    private String estado;
}
