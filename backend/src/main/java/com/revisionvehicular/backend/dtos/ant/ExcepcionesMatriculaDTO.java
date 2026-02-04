package com.revisionvehicular.backend.dtos.ant;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ExcepcionesMatriculaDTO {

    private Long idExcepcion;

    private Long idEstadoExcepcion;
    private String codigoExcepcion;

    private LocalDate fechaInicio;
    private LocalDate fechaFin;

    private String articuloLegal;
    private String observacion;
    private String estado;
}
