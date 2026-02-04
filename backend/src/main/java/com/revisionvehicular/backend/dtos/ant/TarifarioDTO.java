package com.revisionvehicular.backend.dtos.ant;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class TarifarioDTO {

    private Long idTarifario;
    private BigDecimal valor;
    private String estado;

    private Long idTipoVehiculo;
    private Long idCategoria;
    private Long idTipoMatricula;
}
