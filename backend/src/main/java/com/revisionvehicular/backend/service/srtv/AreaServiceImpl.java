package com.revisionvehicular.backend.service.srtv;

import com.revisionvehicular.backend.dtos.srtv.AreaDTO;
import com.revisionvehicular.backend.entities.srtv.Area;
import com.revisionvehicular.backend.repositories.srtv.IAreaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AreaServiceImpl implements IAreaService {
    private final IAreaRepository repository;
    private final AuditoriaService auditoriaService;

    @Autowired
    public AreaServiceImpl(IAreaRepository repository, AuditoriaService auditoriaService) {
        this.repository = repository;
        this.auditoriaService = auditoriaService;
    }

    @Override
    public AreaDTO save(AreaDTO dto) {
        repository.spAreaInsertar(dto.getNombre(), dto.getEstado());
        Area area = repository.getByNombre(dto.getNombre()).
                orElseThrow(()-> new RuntimeException("Area no encontrada"));
        auditoriaService.registrar("INSERT", "Área", "Creó el área \"" + dto.getNombre() + "\"");
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
        auditoriaService.registrar("UPDATE", "Área", "Actualizó el área \"" + dto.getNombre() + "\" (ID: " + id + ")");
        return toDTO(AreaActualizado);
    }

    public void delete(Long id) {
        if(repository.existsById(id)){
            Area a = repository.findById(id).orElse(null);
            String nombre = a != null ? a.getNombre() : "ID " + id;
            repository.deleteById(id);
            auditoriaService.registrar("DELETE", "Área", "Eliminó el área \"" + nombre + "\" (ID: " + id + ")");
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
