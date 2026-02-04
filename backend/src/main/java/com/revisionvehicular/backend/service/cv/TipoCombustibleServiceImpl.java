package com.revisionvehicular.backend.service.cv;

import com.revisionvehicular.backend.dtos.cv.TipoCombustibleDTO;
import com.revisionvehicular.backend.entities.cv.TipoCombustible;
import com.revisionvehicular.backend.repositories.cv.ITipoCombustibleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TipoCombustibleServiceImpl implements ITipoCombustibleService {

    private final ITipoCombustibleRepository repository;

    @Autowired
    public TipoCombustibleServiceImpl(ITipoCombustibleRepository repository) {
        this.repository = repository;
    }

    private TipoCombustibleDTO toDTO(TipoCombustible tipo) {
        TipoCombustibleDTO dto = new TipoCombustibleDTO();
        dto.setId(tipo.getTipocombustibleid());
        dto.setNombre(tipo.getNombre());
        dto.setDescripcion(tipo.getDescripcion());
        dto.setEstado(tipo.getEstado());
        return dto;
    }

    @Override
    public TipoCombustibleDTO save(TipoCombustibleDTO dto) {

        repository.spInsertarTipoCombustible(
                dto.getNombre(),
                dto.getDescripcion(),
                dto.getEstado()
        );

        TipoCombustible tipo = repository.findByNombre(dto.getNombre())
                .orElseThrow(() ->
                        new RuntimeException("Tipo de combustible no encontrado")
                );

        return toDTO(tipo);
    }

    @Override
    public List<TipoCombustibleDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public TipoCombustibleDTO update(Long id, TipoCombustibleDTO dto) {

        TipoCombustible tipo = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Tipo de combustible " + id + " no encontrado")
                );

        repository.spModificarTipoCombustible(
                id,
                dto.getNombre(),
                dto.getDescripcion(),
                dto.getEstado()
        );

        TipoCombustible updated = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Error al actualizar el tipo de combustible")
                );

        return toDTO(updated);
    }

    @Override
    public void delete(Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
        } else {
            throw new RuntimeException("El tipo de combustible no existe");
        }
    }

    @Override
    public TipoCombustibleDTO findById(Long id) {

        TipoCombustible tipo = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Tipo de combustible no encontrado con ID: " + id)
                );

        return toDTO(tipo);
    }
}
