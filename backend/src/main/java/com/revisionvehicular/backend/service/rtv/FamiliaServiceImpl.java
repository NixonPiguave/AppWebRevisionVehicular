package com.revisionvehicular.backend.service.rtv;

import com.revisionvehicular.backend.dtos.rtv.FamiliaDTO;
import com.revisionvehicular.backend.entities.rtv.Familia;
import com.revisionvehicular.backend.repositories.rtv.IFamiliaRepository;
import com.revisionvehicular.backend.service.srtv.AuditoriaService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FamiliaServiceImpl implements IFamiliaService {

    private final IFamiliaRepository repository;
    private final AuditoriaService auditoriaService;

    public FamiliaServiceImpl(IFamiliaRepository repository, AuditoriaService auditoriaService) {
        this.repository = repository;
        this.auditoriaService = auditoriaService;
    }

    private FamiliaDTO toDTO(Familia entity) {
        FamiliaDTO dto = new FamiliaDTO();
        dto.setId(entity.getFamiliaid());
        dto.setNombre(entity.getNombre());
        dto.setDescripcion(entity.getDescripcion());
        dto.setEstado(entity.getEstado());
        return dto;
    }

    @Override
    public FamiliaDTO save(FamiliaDTO dto) {

        repository.insertarFamilia(
                dto.getNombre(),
                dto.getDescripcion(),
                dto.getEstado()
        );

        Familia familia = repository.findAll()
                .stream()
                .filter(f -> f.getNombre().equals(dto.getNombre()))
                .findFirst()
                .orElseThrow(() ->
                        new RuntimeException("Error al insertar familia")
                );
        auditoriaService.registrar("INSERT", "Familia", "Creó la familia de defectos \"" + dto.getNombre() + "\"");
        return toDTO(familia);
    }

    @Override
    public FamiliaDTO update(Long id, FamiliaDTO dto) {

        Familia existente = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Familia no encontrada con ID: " + id)
                );

        repository.actualizarFamilia(
                id,
                dto.getNombre(),
                dto.getDescripcion(),
                dto.getEstado()
        );

        Familia actualizada = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Error al actualizar familia")
                );
        auditoriaService.registrar("UPDATE", "Familia", "Actualizó la familia \"" + dto.getNombre() + "\" (ID: " + id + ")");
        return toDTO(actualizada);
    }

    @Override
    public void delete(Long id) {
        if (repository.existsById(id)) {
            Familia f = repository.findById(id).orElse(null);
            String nombre = f != null ? f.getNombre() : "ID " + id;
            repository.deleteById(id);
            auditoriaService.registrar("DELETE", "Familia", "Eliminó la familia \"" + nombre + "\" (ID: " + id + ")");
        } else {
            throw new RuntimeException("La familia no existe");
        }
    }

    @Override
    public FamiliaDTO findById(Long id) {

        Familia familia = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Familia no encontrada con ID: " + id)
                );

        return toDTO(familia);
    }

    @Override
    public List<FamiliaDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}
