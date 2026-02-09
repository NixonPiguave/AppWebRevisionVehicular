package com.revisionvehicular.backend.service.ant;

import com.revisionvehicular.backend.repositories.ant.ExcepcionMatriculaRepository;
import com.revisionvehicular.backend.service.ant.IExcepcionMatriculaService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class ExcepcionMatriculaServiceImpl implements IExcepcionMatriculaService {

    private final ExcepcionMatriculaRepository repository;

    public ExcepcionMatriculaServiceImpl(ExcepcionMatriculaRepository repository) {

        this.repository = repository;
    }

    @Override
    public void insertar(Long idEstadoExcepcion,LocalDate fechaInicio,LocalDate fechaFin,String articuloLegal,String observacion,String estado) {
        repository.insertar(idEstadoExcepcion,fechaInicio,fechaFin,articuloLegal,observacion,estado);
    }

    @Override
    public void modificar(Long idExcepcion,Long idEstadoExcepcion,LocalDate fechaInicio,LocalDate fechaFin,String articuloLegal,String observacion,String estado) {
        repository.modificar(idExcepcion,idEstadoExcepcion,fechaInicio,fechaFin,articuloLegal,observacion,estado);
    }
}
