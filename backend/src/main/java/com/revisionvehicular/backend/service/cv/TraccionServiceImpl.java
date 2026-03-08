package com.revisionvehicular.backend.service.cv;

import com.revisionvehicular.backend.dtos.cv.TraccionDTO;
import com.revisionvehicular.backend.entities.cv.Traccion;
import com.revisionvehicular.backend.repositories.cv.ITraccionRepository;
import com.revisionvehicular.backend.service.srtv.AuditoriaService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TraccionServiceImpl implements ITraccionService {

    private final ITraccionRepository repository;
    private final AuditoriaService auditoriaService;

    public TraccionServiceImpl(ITraccionRepository repository, AuditoriaService auditoriaService) {
        this.repository = repository;
        this.auditoriaService = auditoriaService;
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

               repository.insertarTraccion(
                dto.getTipo(),
                dto.getDescripcion(),
                dto.getEstado()
        );

        Traccion traccion = repository.getByTipo(dto.getTipo())
                .orElseThrow(() ->
                        new RuntimeException("Error al insertar tracción")
                );
        auditoriaService.registrar("INSERT", "Traccion", "Creó la tracción \"" + dto.getTipo() + "\"");
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
        auditoriaService.registrar("UPDATE", "Traccion", "Actualizó la tracción \"" + dto.getTipo() + "\" (ID: " + id + ")");
        return toDTO(actualizada);
    }

    @Override
    public void delete(Long id) {
        if (repository.existsById(id)) {
            Traccion t = repository.findById(id).orElse(null);
            String nombre = t != null ? t.getTipo() : "ID " + id;
            repository.deleteById(id);
            auditoriaService.registrar("DELETE", "Traccion", "Eliminó la tracción \"" + nombre + "\" (ID: " + id + ")");
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
