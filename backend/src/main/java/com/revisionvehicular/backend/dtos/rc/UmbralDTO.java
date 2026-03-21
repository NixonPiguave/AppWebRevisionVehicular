package com.revisionvehicular.backend.dtos.rc;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UmbralDTO {

    private Long idUmbral;

    private BigDecimal valorMin;
    private BigDecimal valorMax;

    private Integer calificacion;
    private Integer incValorMin;
    private Integer incValorMax;

    @NotNull(message = "Debe seleccionar una unidad de medida")
    private Long idUnidadMedida;

    @NotNull(message = "Debe seleccionar una descripción")
    private Long idDescripcionUmbral;

    private String estado;

    @AssertTrue(message = "El valor mínimo debe ser menor al valor máximo")
    public boolean isValorMinMenorQueMax() {
        if (valorMin == null || valorMax == null) return true;
        return valorMin.compareTo(valorMax) < 0;
    }
}