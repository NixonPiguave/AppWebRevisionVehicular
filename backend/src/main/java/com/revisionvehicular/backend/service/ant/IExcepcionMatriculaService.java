package com.revisionvehicular.backend.service.ant;

import java.time.LocalDate;

public interface IExcepcionMatriculaService {

    void insertar(Long idEstadoExcepcion,LocalDate fechaInicio,LocalDate fechaFin,String articuloLegal,String observacion,String estado);

    void modificar(Long idExcepcion,Long idEstadoExcepcion,LocalDate fechaInicio,LocalDate fechaFin,String articuloLegal,String observacion,String estado);
}
