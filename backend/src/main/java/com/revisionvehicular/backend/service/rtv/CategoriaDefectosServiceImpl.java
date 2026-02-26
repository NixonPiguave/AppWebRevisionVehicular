package com.revisionvehicular.backend.service.rtv;

import com.revisionvehicular.backend.dtos.rtv.CategoriaDTO;
import com.revisionvehicular.backend.entities.rtv.RTV_Categoria;
import com.revisionvehicular.backend.repositories.rtv.ICategoriaDefectosRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoriaDefectosServiceImpl implements ICategoriaDefectosService {

    private final ICategoriaDefectosRepository repository;

    public CategoriaDefectosServiceImpl(ICategoriaDefectosRepository repository) {
        this.repository = repository;
    }

    private CategoriaDTO toDTO(RTV_Categoria entity) {

        CategoriaDTO dto = new CategoriaDTO();
        dto.setId(entity.getRtvcategoria_id());
        dto.setCodigo(entity.getCodigo());
        dto.setNombre(entity.getNombre());
        dto.setDescripcion(entity.getDescripcion());
        dto.setEstado(entity.getEstado());
        dto.setSubfamiliaId(entity.getSubfamilia().getSubfamilia_id());

        return dto;
    }

    @Override
    public CategoriaDTO save(CategoriaDTO dto) {

        repository.insertarCategoria(
                dto.getCodigo(),
                dto.getNombre(),
                dto.getDescripcion(),
                dto.getEstado(),
                dto.getSubfamiliaId()
        );

        RTV_Categoria cat = repository.findAll()
                .stream()
                .filter(c -> c.getCodigo().equals(dto.getCodigo()))
                .findFirst()
                .orElseThrow(() ->
                        new RuntimeException("Error al insertar categoria")
                );

        return toDTO(cat);
    }

    @Override
    public CategoriaDTO update(Long id, CategoriaDTO dto) {

        RTV_Categoria existente = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Categoria no encontrada con ID: " + id)
                );

        repository.actualizarCategoria(
                id,
                dto.getCodigo(),
                dto.getNombre(),
                dto.getDescripcion(),
                dto.getEstado(),
                dto.getSubfamiliaId()
        );

        RTV_Categoria actualizada = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Error al actualizar categoria")
                );

        return toDTO(actualizada);
    }

    @Override
    public void delete(Long id) {

        if (repository.existsById(id)) {
            repository.deleteById(id);
        } else {
            throw new RuntimeException("La categoria no existe");
        }
    }

    @Override
    public CategoriaDTO findById(Long id) {

        RTV_Categoria cat = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Categoria no encontrada con ID: " + id)
                );

        return toDTO(cat);
    }

    @Override
    public List<CategoriaDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}