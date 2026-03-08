package com.revisionvehicular.backend.service.rtv;

import com.revisionvehicular.backend.dtos.rtv.CategoriaDTO;
import com.revisionvehicular.backend.entities.rtv.RTVCategoria;
import com.revisionvehicular.backend.repositories.rtv.ICategoriaDefectosRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoriaDefectosServiceImpl implements ICategoriaDefectosService {

    private final ICategoriaDefectosRepository repository;
    private final com.revisionvehicular.backend.service.srtv.AuditoriaService auditoriaService;

    public CategoriaDefectosServiceImpl(ICategoriaDefectosRepository repository, com.revisionvehicular.backend.service.srtv.AuditoriaService auditoriaService) {
        this.repository = repository;
        this.auditoriaService = auditoriaService;
    }

    private CategoriaDTO toDTO(RTVCategoria entity) {

        CategoriaDTO dto = new CategoriaDTO();
        dto.setId(entity.getRtvcategoriaid());
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

        RTVCategoria cat = repository.findAll()
                .stream()
                .filter(c -> c.getCodigo().equals(dto.getCodigo()))
                .findFirst()
                .orElseThrow(() ->
                        new RuntimeException("Error al insertar categoria")
                );
        auditoriaService.registrar("INSERT", "CategoriaDefecto", "Creó categoría de defectos \"" + dto.getNombre() + "\"");
        return toDTO(cat);
    }

    @Override
    public CategoriaDTO update(Long id, CategoriaDTO dto) {

        RTVCategoria existente = repository.findById(id)
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

        RTVCategoria actualizada = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Error al actualizar categoria")
                );
        auditoriaService.registrar("UPDATE", "CategoriaDefecto", "Actualizó categoría \"" + dto.getNombre() + "\" (ID: " + id + ")");
        return toDTO(actualizada);
    }

    @Override
    public void delete(Long id) {

        if (repository.existsById(id)) {
            RTVCategoria c = repository.findById(id).orElse(null);
            String nombre = c != null ? c.getNombre() : "ID " + id;
            repository.deleteById(id);
            auditoriaService.registrar("DELETE", "CategoriaDefecto", "Eliminó categoría \"" + nombre + "\" (ID: " + id + ")");
        } else {
            throw new RuntimeException("La categoria no existe");
        }
    }

    @Override
    public CategoriaDTO findById(Long id) {

        RTVCategoria cat = repository.findById(id)
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