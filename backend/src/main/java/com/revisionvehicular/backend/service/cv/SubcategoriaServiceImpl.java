package com.revisionvehicular.backend.service.cv;

import com.revisionvehicular.backend.dtos.cv.SubcategoriaDTO;
import com.revisionvehicular.backend.entities.cv.Subcategoria;
import com.revisionvehicular.backend.repositories.cv.ISubcategoriaRepository;
import com.revisionvehicular.backend.service.srtv.AuditoriaService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SubcategoriaServiceImpl implements ISubcategoriaService {

    private final ISubcategoriaRepository repository;
    private final AuditoriaService auditoriaService;

    public SubcategoriaServiceImpl(ISubcategoriaRepository repository, AuditoriaService auditoriaService) {
        this.repository = repository;
        this.auditoriaService = auditoriaService;
    }

    @Transactional
    @Override
    public SubcategoriaDTO save(SubcategoriaDTO dto) {

        repository.spInsertarSubcategoria(
                dto.getCodigoSubcategoria(),
                dto.getNombre(),
                dto.getDescripcion(),
                dto.getCategoriaId(),
                dto.getEstado()
        );

        Subcategoria subcategoria = repository.findByCodigo(dto.getCodigoSubcategoria())
                .orElseThrow(() -> new EntityNotFoundException("Error al crear subcategoría"));
        auditoriaService.registrar("INSERT", "Subcategoria", "Creó la subcategoría \"" + dto.getNombre() + "\"");
        return toDTO(subcategoria);
    }

    @Transactional
    @Override
    public SubcategoriaDTO update(Long id, SubcategoriaDTO dto) {

        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Subcategoría no encontrada con ID: " + id);
        }

        repository.spModificarSubcategoria(
                id,
                dto.getCodigoSubcategoria(),
                dto.getNombre(),
                dto.getDescripcion(),
                dto.getCategoriaId(),
                dto.getEstado()
        );

        Subcategoria actualizada = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Error al recuperar subcategoría actualizada"));
        auditoriaService.registrar("UPDATE", "Subcategoria", "Actualizó la subcategoría \"" + dto.getNombre() + "\" (ID: " + id + ")");
        return toDTO(actualizada);
    }

    @Override
    public SubcategoriaDTO findById(Long id) {
        Subcategoria subcategoria = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Subcategoría no encontrada con ID: " + id));
        return toDTO(subcategoria);
    }

    @Override
    public List<SubcategoriaDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Subcategoría no encontrada con ID: " + id);
        }
        Subcategoria s = repository.findById(id).orElse(null);
        String nombre = s != null ? s.getNombre() : "ID " + id;
        repository.deleteById(id);
        auditoriaService.registrar("DELETE", "Subcategoria", "Eliminó la subcategoría \"" + nombre + "\" (ID: " + id + ")");
    }

    private SubcategoriaDTO toDTO(Subcategoria subcategoria) {

        SubcategoriaDTO dto = new SubcategoriaDTO();
        dto.setCategoriaId(subcategoria.getSubcategoriaid());
        dto.setCodigoSubcategoria(subcategoria.getCodigo());
        dto.setNombre(subcategoria.getNombre());
        dto.setDescripcion(subcategoria.getDescripcion());
        dto.setEstado(subcategoria.getEstado());
        dto.setId(subcategoria.getSubcategoriaid());

        if (subcategoria.getCategoria() != null) {
            dto.setCategoriaId(subcategoria.getCategoria().getCategoriaid());
        }

        return dto;
    }
}
