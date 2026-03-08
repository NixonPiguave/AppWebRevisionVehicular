package com.revisionvehicular.backend.service.cv;

import com.revisionvehicular.backend.dtos.cv.ClaseDTO;
import com.revisionvehicular.backend.entities.cv.Clase;
import com.revisionvehicular.backend.repositories.cv.IClaseRepository;
import com.revisionvehicular.backend.service.srtv.AuditoriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClaseServiceImpl implements IClaseService {

    private final IClaseRepository repository;
    private final AuditoriaService auditoriaService;

    @Autowired
    public ClaseServiceImpl(IClaseRepository repository, AuditoriaService auditoriaService) {
        this.repository = repository;
        this.auditoriaService = auditoriaService;
    }

    private ClaseDTO toDTO(Clase clase) {
        ClaseDTO dto = new ClaseDTO();
        dto.setId(clase.getClaseId());
        dto.setClase(clase.getClase());
        dto.setDescripcion(clase.getDescripcion());
        dto.setEstado(clase.getEstado());
        return dto;
    }

    @Override
    public ClaseDTO save(ClaseDTO dto) {

        repository.spInsertarClase(
                dto.getClase(),
                dto.getDescripcion(),
                dto.getEstado()
        );

        Clase clase = repository.getByClase(dto.getClase())
                .orElseThrow(() ->
                        new RuntimeException("Clase no encontrada")
                );
        auditoriaService.registrar("INSERT", "Clase", "Creó la clase \"" + dto.getClase() + "\"");
        return toDTO(clase);
    }

    @Override
    public List<ClaseDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ClaseDTO update(Long id, ClaseDTO dto) {

        Clase clase = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Clase " + id + " no encontrada")
                );

        repository.spModificarClase(
                id,
                dto.getClase(),
                dto.getDescripcion(),
                dto.getEstado()
        );

        Clase updated = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Error al actualizar la clase")
                );
        auditoriaService.registrar("UPDATE", "Clase", "Actualizó la clase \"" + dto.getClase() + "\" (ID: " + id + ")");
        return toDTO(updated);
    }

    @Override
    public void delete(Long id) {
        if (repository.existsById(id)) {
            Clase c = repository.findById(id).orElse(null);
            String nombre = c != null ? c.getClase() : "ID " + id;
            repository.deleteById(id);
            auditoriaService.registrar("DELETE", "Clase", "Eliminó la clase \"" + nombre + "\" (ID: " + id + ")");
        } else {
            throw new RuntimeException("La clase no existe");
        }
    }

    @Override
    public ClaseDTO findById(Long id) {

        Clase clase = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Clase no encontrada con ID: " + id)
                );

        return toDTO(clase);
    }
}
