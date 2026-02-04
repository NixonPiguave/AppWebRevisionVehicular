package com.revisionvehicular.backend.service.rc;

import com.revisionvehicular.backend.dtos.rc.UnidadesMedidaDTO;
import com.revisionvehicular.backend.entities.rc.UnidadMedida;
import com.revisionvehicular.backend.repositories.rc.IUnidadesMedidaRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UnidadMedidaServiceImpl implements IUnidadMedidaService {

    private final IUnidadesMedidaRepository repository;

    public UnidadMedidaServiceImpl(IUnidadesMedidaRepository repository) {
        this.repository = repository;
    }

    private UnidadesMedidaDTO toDTO(UnidadMedida entity) {
        UnidadesMedidaDTO dto = new UnidadesMedidaDTO();
        dto.setIdUnidadMedida(entity.getUmedida_id());
        dto.setNombre(entity.getNombre());
        dto.setSimbolo(entity.getSimbolo());
        dto.setDescripcion(entity.getDescripcion());
        dto.setEstado(entity.getEstado());
        return dto;
    }

    @Override
    public UnidadesMedidaDTO save(UnidadesMedidaDTO dto) {

        repository.insertarUnidadMedida(
                dto.getNombre(),
                dto.getSimbolo(),
                dto.getDescripcion(),
                dto.getEstado()
        );

        UnidadMedida unidad = repository.findAll()
                .stream()
                .filter(u -> u.getNombre().equals(dto.getNombre()))
                .findFirst()
                .orElseThrow(() ->
                        new RuntimeException("Error al insertar unidad de medida")
                );

        return toDTO(unidad);
    }

    @Override
    public UnidadesMedidaDTO update(Long id, UnidadesMedidaDTO dto) {

        repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Unidad de medida no encontrada con ID: " + id)
                );

        repository.actualizarUnidadMedida(
                id,
                dto.getNombre(),
                dto.getSimbolo(),
                dto.getDescripcion(),
                dto.getEstado()
        );

        UnidadMedida actualizada = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Error al actualizar unidad de medida")
                );

        return toDTO(actualizada);
    }

    @Override
    public void delete(Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
        } else {
            throw new RuntimeException("La unidad de medida no existe");
        }
    }

    @Override
    public UnidadesMedidaDTO findById(Long id) {

        UnidadMedida unidad = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Unidad de medida no encontrada con ID: " + id)
                );

        return toDTO(unidad);
    }

    @Override
    public List<UnidadesMedidaDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}
