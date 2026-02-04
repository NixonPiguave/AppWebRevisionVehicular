package com.revisionvehicular.backend.service.cv;

import com.revisionvehicular.backend.dtos.cv.TipoMatriculaDTO;
import com.revisionvehicular.backend.entities.cv.TipoMatricula;
import com.revisionvehicular.backend.repositories.cv.ITipoMatriculaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TipoMatriculaServiceImpl implements ITipoMatriculaService {

    private final ITipoMatriculaRepository repository;

    @Autowired
    public TipoMatriculaServiceImpl(ITipoMatriculaRepository repository) {
        this.repository = repository;
    }

    private TipoMatriculaDTO toDTO(TipoMatricula tipo) {
        TipoMatriculaDTO dto = new TipoMatriculaDTO();
        dto.setId(tipo.getTipomatriculaid());
        dto.setNombre(tipo.getNombre());
        dto.setDescripcion(tipo.getDescripcion());
        dto.setEstado(tipo.getEstado());
        return dto;
    }

    @Override
    public TipoMatriculaDTO save(TipoMatriculaDTO dto) {

        repository.spInsertarTipoMatricula(
                dto.getNombre(),
                dto.getDescripcion(),
                dto.getEstado()
        );

        TipoMatricula tipo = repository.findByNombre(dto.getNombre())
                .orElseThrow(() ->
                        new RuntimeException("Tipo de matrícula no encontrado")
                );

        return toDTO(tipo);
    }

    @Override
    public List<TipoMatriculaDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public TipoMatriculaDTO update(Long id, TipoMatriculaDTO dto) {

        TipoMatricula tipo = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Tipo de matrícula " + id + " no encontrado")
                );

        repository.spModificarTipoMatricula(
                id,
                dto.getNombre(),
                dto.getDescripcion(),
                dto.getEstado()
        );

        TipoMatricula updated = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Error al actualizar el tipo de matrícula")
                );

        return toDTO(updated);
    }

    @Override
    public void delete(Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
        } else {
            throw new RuntimeException("El tipo de matrícula no existe");
        }
    }

    @Override
    public TipoMatriculaDTO findById(Long id) {

        TipoMatricula tipo = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Tipo de matrícula no encontrado con ID: " + id)
                );

        return toDTO(tipo);
    }
}
