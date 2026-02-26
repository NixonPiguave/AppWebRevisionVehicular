package com.revisionvehicular.backend.dtos.rc;

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

    private Long idUnidadMedida;
    private Long idDescripcionUmbral;

    private String estado;
}