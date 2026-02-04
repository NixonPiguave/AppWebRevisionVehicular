package com.revisionvehicular.backend.service.cv;

import com.revisionvehicular.backend.dtos.cv.TraccionDTO;
import com.revisionvehicular.backend.entities.cv.Traccion;
import com.revisionvehicular.backend.repositories.cv.ITraccionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TraccionServiceImpl implements ITraccionService {

    private final ITraccionRepository repository;

    public TraccionServiceImpl(ITraccionRepository repository) {
        this.repository = repository;
    }

    private TraccionDTO toDTO(Traccion traccion) {
        TraccionDTO dto = new TraccionDTO();
        dto.setId(traccion.getTraccionid());
        dto.setTipo(traccion.getTipo());
        dto.setDescripcion(traccion.getDescripcion());
        dto.setEstado(traccion.getEstado());
        return dto;
    }

    @Override
    public TraccionDTO save(TraccionDTO dto) {

        Long id = repository.insertarTraccion(
                dto.getTipo(),
                dto.getDescripcion(),
                dto.getEstado()
        );

        Traccion traccion = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Error al insertar tracción")
                );

        return toDTO(traccion);
    }

    @Override
    public TraccionDTO update(Long id, TraccionDTO dto) {

        Traccion existente = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Tracción no encontrada con ID: " + id)
                );

        repository.actualizarTraccion(
                id,
                dto.getTipo(),
                dto.getDescripcion(),
                dto.getEstado()
        );

        Traccion actualizada = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Error al actualizar tracción")
                );

        return toDTO(actualizada);
    }

    @Override
    public void delete(Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
        } else {
            throw new RuntimeException("La tracción no existe");
        }
    }

    @Override
    public TraccionDTO findById(Long id) {

        Traccion traccion = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Tracción no encontrada con ID: " + id)
                );

        return toDTO(traccion);
    }

    @Override
    public List<TraccionDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}
