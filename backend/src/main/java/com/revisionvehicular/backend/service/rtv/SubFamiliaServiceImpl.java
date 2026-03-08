package com.revisionvehicular.backend.service.rtv;

import com.revisionvehicular.backend.dtos.rtv.SubfamiliaDTO;
import com.revisionvehicular.backend.entities.rtv.Subfamilia;
import com.revisionvehicular.backend.repositories.rtv.ISubFamiliaRepository;
import com.revisionvehicular.backend.service.srtv.AuditoriaService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SubFamiliaServiceImpl implements ISubFamiliaService {

    private final ISubFamiliaRepository repository;
    private final AuditoriaService auditoriaService;

    public SubFamiliaServiceImpl(ISubFamiliaRepository repository, AuditoriaService auditoriaService) {
        this.repository = repository;
        this.auditoriaService = auditoriaService;
    }

    private SubfamiliaDTO toDTO(Subfamilia entity) {
        SubfamiliaDTO dto = new SubfamiliaDTO();
        dto.setId(entity.getSubfamilia_id());
        dto.setNombre(entity.getNombre());
        dto.setDescripcion(entity.getDescripcion());
        dto.setEstado(entity.getEstado());
        dto.setFamiliaId(entity.getFamilia().getFamiliaid());
        return dto;
    }

    @Override
    public SubfamiliaDTO save(SubfamiliaDTO dto) {

        repository.insertarSubfamilia(
                dto.getDescripcion(),
                dto.getEstado(),
                dto.getNombre(),
                dto.getFamiliaId()
        );

        Subfamilia sub = repository.findAll()
                .stream()
                .filter(s -> s.getNombre().equals(dto.getNombre()))
                .findFirst()
                .orElseThrow(() ->
                        new RuntimeException("Error al insertar subfamilia")
                );
        auditoriaService.registrar("INSERT", "Subfamilia", "Creó la subfamilia \"" + dto.getNombre() + "\"");
        return toDTO(sub);
    }

    @Override
    public SubfamiliaDTO update(Long id, SubfamiliaDTO dto) {

        Subfamilia existente = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Subfamilia no encontrada con ID: " + id)
                );

        repository.actualizarSubfamilia(
                id,
                dto.getDescripcion(),
                dto.getEstado(),
                dto.getNombre(),
                dto.getFamiliaId()
        );

        Subfamilia actualizada = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Error al actualizar subfamilia")
                );
        auditoriaService.registrar("UPDATE", "Subfamilia", "Actualizó la subfamilia \"" + dto.getNombre() + "\" (ID: " + id + ")");
        return toDTO(actualizada);
    }

    @Override
    public void delete(Long id) {

        if (repository.existsById(id)) {
            Subfamilia s = repository.findById(id).orElse(null);
            String nombre = s != null ? s.getNombre() : "ID " + id;
            repository.deleteById(id);
            auditoriaService.registrar("DELETE", "Subfamilia", "Eliminó la subfamilia \"" + nombre + "\" (ID: " + id + ")");
        } else {
            throw new RuntimeException("La subfamilia no existe");
        }
    }

    @Override
    public SubfamiliaDTO findById(Long id) {

        Subfamilia sub = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Subfamilia no encontrada con ID: " + id)
                );

        return toDTO(sub);
    }

    @Override
    public List<SubfamiliaDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}