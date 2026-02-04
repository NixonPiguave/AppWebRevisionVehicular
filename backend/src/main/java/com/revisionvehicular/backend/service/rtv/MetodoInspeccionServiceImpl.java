package com.revisionvehicular.backend.service.rtv;

import com.revisionvehicular.backend.dtos.rtv.MetodoInspeccionDTO;
import com.revisionvehicular.backend.entities.rtv.MetodoInspeccion;
import com.revisionvehicular.backend.repositories.rtv.IMetodoInspeccionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MetodoInspeccionServiceImpl implements IMetodoInspeccionService {

    private final IMetodoInspeccionRepository repository;

    public MetodoInspeccionServiceImpl(IMetodoInspeccionRepository repository) {
        this.repository = repository;
    }

    private MetodoInspeccionDTO toDTO(MetodoInspeccion entity) {
        MetodoInspeccionDTO dto = new MetodoInspeccionDTO();
        dto.setId(entity.getMetodoinspeccionid());
        dto.setNombre(entity.getNombre());
        dto.setDescripcion(entity.getDescripcion());
        dto.setEstado(entity.getEstado());
        return dto;
    }

    @Override
    public MetodoInspeccionDTO save(MetodoInspeccionDTO dto) {

        repository.insertarMetodoInspeccion(
                dto.getNombre(),
                dto.getDescripcion(),
                dto.getEstado()
        );

        MetodoInspeccion metodo = repository.findAll()
                .stream()
                .filter(m -> m.getNombre().equals(dto.getNombre()))
                .findFirst()
                .orElseThrow(() ->
                        new RuntimeException("Error al insertar método de inspección")
                );

        return toDTO(metodo);
    }

    @Override
    public MetodoInspeccionDTO update(Long id, MetodoInspeccionDTO dto) {

        MetodoInspeccion existente = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Método de inspección no encontrado con ID: " + id)
                );

        repository.actualizarMetodoInspeccion(
                id,
                dto.getNombre(),
                dto.getDescripcion(),
                dto.getEstado()
        );

        MetodoInspeccion actualizado = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Error al actualizar método de inspección")
                );

        return toDTO(actualizado);
    }

    @Override
    public void delete(Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
        } else {
            throw new RuntimeException("El método de inspección no existe");
        }
    }

    @Override
    public MetodoInspeccionDTO findById(Long id) {

        MetodoInspeccion metodo = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Método de inspección no encontrado con ID: " + id)
                );

        return toDTO(metodo);
    }

    @Override
    public List<MetodoInspeccionDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}
