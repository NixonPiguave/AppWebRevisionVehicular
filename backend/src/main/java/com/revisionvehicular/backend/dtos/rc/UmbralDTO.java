package com.revisionvehicular.backend.dtos.rc;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class UmbralDTO {

    private Long idUmbral;

    private BigDecimal valorMin;
    private BigDecimal valorMax;

    private Long idUnidadMedida;

    private String estado;
}
