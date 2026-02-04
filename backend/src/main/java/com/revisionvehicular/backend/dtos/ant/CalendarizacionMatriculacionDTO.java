package com.revisionvehicular.backend.dtos.ant;

import lombok.Data;

@Data
public class CalendarizacionMatriculacionDTO {

    private Long idCalendarizacion;
    private Integer ultimoDigitoPlaca;
    private Integer mes;
    private Integer tipo;
    private String estado;
}
