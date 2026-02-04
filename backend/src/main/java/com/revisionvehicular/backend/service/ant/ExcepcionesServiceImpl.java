package com.revisionvehicular.backend.service.ant;

import com.revisionvehicular.backend.dtos.ant.ExcepcionesDTO;
import com.revisionvehicular.backend.entities.ant.Excepciones;
import com.revisionvehicular.backend.repositories.ant.IExcepcionesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExcepcionesServiceImpl implements IExcepcionesService {
    private final IExcepcionesRepository repository;

    @Autowired
    public ExcepcionesServiceImpl(IExcepcionesRepository repository) {
        this.repository = repository;
    }

    @Override
    public ExcepcionesDTO save(ExcepcionesDTO dto) {
        repository.insertarExcepcion(dto.getCodigo(), dto.getDescripcion(), dto.getFinaliza(), dto.getEstado());
        Excepciones excepcion = repository.findAll().stream()
                .filter(e -> e.getCodigo().equals(dto.getCodigo()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Error al crear excepción"));
        return toDTO(excepcion);
    }

    @Override
    public ExcepcionesDTO findById(Long id) {
        Excepciones excepcion = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Excepción no encontrada con ID: " + id));
        return toDTO(excepcion);
    }

    @Override
    public List<ExcepcionesDTO> findAll() {
        return repository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ExcepcionesDTO update(Long id, ExcepcionesDTO dto) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Excepción no encontrada con ID: " + id);
        }
        repository.actualizarExcepcion(id, dto.getCodigo(), dto.getDescripcion(), dto.getFinaliza(), dto.getEstado());
        Excepciones excepcionActualizada = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error al recuperar la excepción actualizada"));
        return toDTO(excepcionActualizada);
    }

    @Override
    public void delete(Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
        } else {
            throw new RuntimeException("La excepción no existe");
        }
    }

    private ExcepcionesDTO toDTO(Excepciones excepcion) {
        ExcepcionesDTO dto = new ExcepcionesDTO();
        dto.setIdEstadoExcepcion(excepcion.getIdEstadoExcepcion());
        dto.setCodigo(excepcion.getCodigo());
        dto.setDescripcion(excepcion.getDescripcion());
        dto.setFinaliza(excepcion.getFinaliza());
        dto.setEstado(excepcion.getEstado());
        return dto;
    }
}