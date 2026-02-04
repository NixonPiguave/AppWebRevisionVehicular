package com.revisionvehicular.backend.service.ant;

import com.revisionvehicular.backend.dtos.ant.EstadoMultaDTO;
import com.revisionvehicular.backend.entities.ant.EstadoMulta;
import com.revisionvehicular.backend.repositories.ant.IEstadoMultaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EstadoMultaServiceImpl implements IEstadoMultaService {
    private final IEstadoMultaRepository repository;

    @Autowired
    public EstadoMultaServiceImpl(IEstadoMultaRepository repository) {
        this.repository = repository;
    }

    @Override
    public EstadoMultaDTO save(EstadoMultaDTO dto) {
        repository.insertarEstadoMulta(dto.getTipoMulta(), dto.getDescripcion(), dto.getEstado());
        EstadoMulta estadoMulta = repository.findAll().stream()
                .filter(em -> em.getTipoMulta().equals(dto.getTipoMulta()) && em.getDescripcion().equals(dto.getDescripcion()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Error al crear estado multa"));
        return toDTO(estadoMulta);
    }

    @Override
    public EstadoMultaDTO findById(Long id) {
        EstadoMulta estadoMulta = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Estado multa no encontrado con ID: " + id));
        return toDTO(estadoMulta);
    }

    @Override
    public List<EstadoMultaDTO> findAll() {
        return repository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public EstadoMultaDTO update(Long id, EstadoMultaDTO dto) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Estado multa no encontrado con ID: " + id);
        }
        repository.actualizarEstadoMulta(id, dto.getTipoMulta(), dto.getDescripcion(), dto.getEstado());
        EstadoMulta estadoMultaActualizado = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error al recuperar el estado multa actualizado"));
        return toDTO(estadoMultaActualizado);
    }

    @Override
    public void delete(Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
        } else {
            throw new RuntimeException("El estado multa no existe");
        }
    }

    private EstadoMultaDTO toDTO(EstadoMulta estadoMulta) {
        EstadoMultaDTO dto = new EstadoMultaDTO();
        dto.setIdEstadoMulta(estadoMulta.getEstadoMulta());
        dto.setTipoMulta(estadoMulta.getTipoMulta());
        dto.setDescripcion(estadoMulta.getDescripcion());
        dto.setEstado(estadoMulta.getEstado());
        return dto;
    }
}