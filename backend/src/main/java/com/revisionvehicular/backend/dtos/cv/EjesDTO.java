package com.revisionvehicular.backend.dtos.cv;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EjesDTO {
    private Long id;

    @NotNull(message = "La cantidad de ejes es obligatoria")
    @Min(value = 1, message = "La cantidad de ejes debe ser al menos 1")
    private Integer cantidad;
    private String descripcion;
    private String estado;
}
