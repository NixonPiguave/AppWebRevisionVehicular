package com.revisionvehicular.backend.service;

import com.revisionvehicular.backend.dtos.srtv.PermisoDTO;
import com.revisionvehicular.backend.entities.srtv.Permiso;
import com.revisionvehicular.backend.repositories.srtv.IPermisoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PermisoServiceImpl implements IPermisoService {

    private final IPermisoRepository repository;

    @Autowired
    public PermisoServiceImpl(IPermisoRepository repository) {
        this.repository = repository;
    }

    @Override
    public PermisoDTO save(PermisoDTO dto) {
        Long nuevoId = repository.spInsertarPermiso(
                null,
                dto.getCodigo(),
                dto.getNombre(),
                dto.getModulo(),
                dto.getEstado(),
                dto.getDescripcion()
        );
        Permiso permiso = repository.findById(nuevoId)
                .orElseThrow(() -> new RuntimeException("Error al crear permiso"));
        return toDTO(permiso);
    }

    @Override
    public PermisoDTO findById(Long id) {
        Permiso permiso = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Permiso no encontrado con ID: " + id));
        return toDTO(permiso);
    }

    @Override
    public List<PermisoDTO> findAll() {
        return repository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public PermisoDTO update(Long id, PermisoDTO dto) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Permiso no encontrado con ID: " + id);
        }
        repository.spActualizarPermiso(
                id,
                dto.getCodigo(),
                dto.getNombre(),
                dto.getModulo(),
                dto.getEstado(),
                dto.getDescripcion()
        );
        Permiso permisoActualizado = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error al recuperar el permiso actualizado"));
        return toDTO(permisoActualizado);
    }

    @Override
    public void delete(Long id) {
        if (repository.existsById(id)) {
            repository.spEliminarPermiso(id, false);
        } else {
            throw new RuntimeException("El permiso no existe");
        }
    }

    private PermisoDTO toDTO(Permiso permiso) {
        PermisoDTO dto = new PermisoDTO();
        dto.setPermisoId(permiso.getPermisoId());
        dto.setCodigo(permiso.getCodigo());
        dto.setNombre(permiso.getNombre());
        dto.setModulo(permiso.getModulo());
        dto.setEstado(permiso.getEstado());
        dto.setDescripcion(permiso.getDescripcion());
        return dto;
    }
}