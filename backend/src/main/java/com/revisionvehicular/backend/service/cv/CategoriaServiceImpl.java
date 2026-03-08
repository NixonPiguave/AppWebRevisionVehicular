package com.revisionvehicular.backend.service.cv;

import com.revisionvehicular.backend.dtos.cv.CategoriaDTO;
import com.revisionvehicular.backend.entities.cv.Categoria;
import com.revisionvehicular.backend.repositories.cv.ICategoriaRepository;
import com.revisionvehicular.backend.service.srtv.AuditoriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoriaServiceImpl implements ICategoriaService {
    private final ICategoriaRepository repository;
    private final AuditoriaService auditoriaService;

    @Autowired
    public CategoriaServiceImpl(ICategoriaRepository repository, AuditoriaService auditoriaService) {
        this.repository = repository;
        this.auditoriaService = auditoriaService;
    }
    private CategoriaDTO toDTO(Categoria categoria) {
        CategoriaDTO dto = new CategoriaDTO();
        dto.setCategoriaid(categoria.getCategoriaid());
        dto.setNombre(categoria.getNombre());
        dto.setDescripcion(categoria.getDescripcion());
        dto.setEstado(categoria.getEstado());
        dto.setCodigo(categoria.getCodigo());
        return dto;
    }
    @Override
    public CategoriaDTO save(CategoriaDTO dto) {
        repository.spInsertarCategoria(
                dto.getCodigo(),
                dto.getNombre(),
                dto.getEstado(),
                dto.getDescripcion()
        );
        Categoria cate = repository.getByNombre(dto.getNombre()).
                orElseThrow(()-> new RuntimeException("Categoria no encontrada"));
        auditoriaService.registrar("INSERT", "Categoria", "Creó la categoría \"" + dto.getNombre() + "\"");
        return toDTO(cate);
    }

    @Override
    public List<CategoriaDTO> findAll() {
        return repository.findAll().stream().
                map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public CategoriaDTO update(Long id, CategoriaDTO dto) {
        Categoria cate = repository.findById(id).
                orElseThrow(()-> new RuntimeException("Categoria " + id + " no encontrada"));
        cate.setNombre(dto.getNombre());
        cate.setEstado(dto.getEstado());
        cate.setDescripcion(dto.getDescripcion());
        cate.setCodigo(dto.getCodigo());
        Categoria updated= repository.save(cate);
        auditoriaService.registrar("UPDATE", "Categoria", "Actualizó la categoría \"" + dto.getNombre() + "\" (ID: " + id + ")");
        return toDTO(updated);
    }
    @Override
    public void delete(Long id) {
        if (repository.existsById(id)) {
            Categoria c = repository.findById(id).orElse(null);
            String nombre = c != null ? c.getNombre() : "ID " + id;
            repository.deleteById(id);
            auditoriaService.registrar("DELETE", "Categoria", "Eliminó la categoría \"" + nombre + "\" (ID: " + id + ")");
        }
        else
            throw new RuntimeException("El categoria no existe");
    }

    @Override
    public CategoriaDTO findById(Long id) {
        Categoria categoria = repository.findById(id).
                orElseThrow(() -> new RuntimeException("Categoria no encontrada con ID: " + id));
        return toDTO(categoria);
    }
}
