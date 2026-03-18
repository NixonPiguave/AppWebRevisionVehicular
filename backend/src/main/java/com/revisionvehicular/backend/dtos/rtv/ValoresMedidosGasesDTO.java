package com.revisionvehicular.backend.dtos.rtv;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ValoresMedidosGasesDTO {
    private String co;
    private String hc;
    private String lambda;
    private String o2;
    private String opacidad;
}