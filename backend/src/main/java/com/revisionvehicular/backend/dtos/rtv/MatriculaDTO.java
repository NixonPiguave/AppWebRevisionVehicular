package com.revisionvehicular.backend.dtos.rtv;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MatriculaDTO {

    private Long id;
    private Integer periodo;
    private LocalDate fechaEmision;
    private LocalDate fechaCaducidad;
    private BigDecimal valorTotal;
    private String estado;

    private Long vehiculoId;
    private Long inspeccionId;
    private Long excepcionMatriculaId;
}
