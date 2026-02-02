package com.revisionvehicular.backend.service;

import com.revisionvehicular.backend.dtos.srtv.AreaDTO;
import com.revisionvehicular.backend.dtos.srtv.RolDTO;
import com.revisionvehicular.backend.entities.srtv.Area;
import com.revisionvehicular.backend.entities.srtv.Rol;
import com.revisionvehicular.backend.repositories.srtv.IAreaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collector;
import java.util.stream.Collectors;

@Service
public class AreaServiceImpl implements IAreaService {
    private final IAreaRepository repository;
    @Autowired
    public AreaServiceImpl(IAreaRepository repository) {
        this.repository = repository;
    }

    @Override
    public AreaDTO save(AreaDTO dto) {
        repository.spAreaInsertar(dto.getNombre(), dto.getEstado());
        Area area = repository.getByNombre(dto.getNombre()).
                orElseThrow(()-> new RuntimeException("Area no encontrada"));
        return toDTO(area);
    }

    @Override
    public List<AreaDTO> findAll() {
        return repository.findAll().stream().map(this::toDTO)
                .collect(Collectors.toList());
    }

    /*@Override
    public AreaDTO update(Long id, AreaDTO dto) {
        Area area = repository.findById(id).
                orElseThrow(()-> new RuntimeException("Area " + id + " no encontrada"));
        area.setNombre(dto.getNombre());
        area.setEstado(dto.getEstado());
        Area updated= repository.save(area);
        return toDTO(updated);
    }*/

    @Override
    public AreaDTO update(Long id, AreaDTO dto) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Area no encontrado con ID: " + id);
        }
        repository.spActualizarArea(id, dto.getNombre(), dto.getEstado());
        Area AreaActualizado = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error al recuperar el Area actualizado"));
        return toDTO(AreaActualizado);
    }

    public void delete(Long id) {
        if(repository.existsById(id)){
            repository.deleteById(id);
        }
        else {
            throw new RuntimeException("No existe el area");
        }
    }

    @Override
    public List<AreaDTO> findById(Long id) {
        return List.of();
    }
    private AreaDTO toDTO(Area area) {
        AreaDTO dto = new AreaDTO();
        dto.setAreaId(area.getAreaId());
        dto.setNombre(area.getNombre());
        dto.setEstado(area.getEstado());
        return dto;
    }
}
