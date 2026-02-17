package com.revisionvehicular.backend.service.srtv;

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
    public List<PermisoDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private PermisoDTO toDTO(Permiso permiso) {
        PermisoDTO dto = new PermisoDTO();
        dto.setPermisoId(permiso.getPermisoId());
        dto.setNombre(permiso.getNombre());
        dto.setModulo(permiso.getModulo());
        dto.setEstado(permiso.getEstado());
        dto.setDescripcion(permiso.getDescripcion());
        return dto;
    }
}