package com.revisionvehicular.backend.service.ant;

import com.revisionvehicular.backend.dtos.ant.EntidadesTransitoDTO;
import com.revisionvehicular.backend.entities.ant.EntidadesTransito;
import com.revisionvehicular.backend.repositories.ant.IEntidadesTransitoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EntidadesTransitoServiceImpl implements IEntidadesTransitoService {

    private final IEntidadesTransitoRepository repository;

    public EntidadesTransitoServiceImpl(IEntidadesTransitoRepository repository) {
        this.repository = repository;
    }

    private EntidadesTransitoDTO toDTO(EntidadesTransito entity) {
        EntidadesTransitoDTO dto = new EntidadesTransitoDTO();
        dto.setIdEntidad(entity.getIdEntidad());
        dto.setCodigo(entity.getCodigo());
        dto.setNombre(entity.getNombre());
        dto.setNivel(entity.getNivel());
        dto.setDescripcion(entity.getDescripcion());
        dto.setEstado(entity.getEstado());
        return dto;
    }

    @Override
    public EntidadesTransitoDTO save(EntidadesTransitoDTO dto) {

        repository.insertarEntidadTransito(
                dto.getCodigo(),
                dto.getNombre(),
                dto.getNivel(),
                dto.getDescripcion(),
                dto.getEstado()
        );

        EntidadesTransito entidad = repository.findAll()
                .stream()
                .filter(e ->
                        e.getCodigo().equals(dto.getCodigo()) &&
                                e.getNombre().equals(dto.getNombre())
                )
                .findFirst()
                .orElseThrow(() ->
                        new RuntimeException("Error al insertar entidad de tránsito")
                );

        return toDTO(entidad);
    }

    @Override
    public EntidadesTransitoDTO update(Long id, EntidadesTransitoDTO dto) {

        EntidadesTransito existente = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Entidad de tránsito no encontrada con ID: " + id)
                );

        repository.actualizarEntidadTransito(
                id,
                dto.getCodigo(),
                dto.getNombre(),
                dto.getNivel(),
                dto.getDescripcion(),
                dto.getEstado()
        );

        EntidadesTransito actualizado = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Error al actualizar entidad de tránsito")
                );

        return toDTO(actualizado);
    }

    @Override
    public void delete(Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
        } else {
            throw new RuntimeException("La entidad de tránsito no existe");
        }
    }

    @Override
    public EntidadesTransitoDTO findById(Long id) {

        EntidadesTransito entidad = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Entidad de tránsito no encontrada con ID: " + id)
                );

        return toDTO(entidad);
    }

    @Override
    public List<EntidadesTransitoDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}
