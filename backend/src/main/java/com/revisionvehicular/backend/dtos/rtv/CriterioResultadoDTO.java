package com.revisionvehicular.backend.dtos.rtv;

import lombok.Data;

@Data
public class CriterioResultadoDTO {
    private Long criterioId;
    private Boolean tipo1Rechaza = false;
    private Boolean tipo2Rechaza = true;
    private Boolean tipo3Rechaza = true;
    /** Cantidad máxima permitida antes de RECHAZADO. null = no aplicar. 0 = cualquier cantidad causa rechazo. */
    private Integer tipo1Max;
    private Integer tipo2Max;
    private Integer tipo3Max;
    private String descripcion;
}
