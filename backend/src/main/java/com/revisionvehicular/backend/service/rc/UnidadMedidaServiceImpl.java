package com.revisionvehicular.backend.service.rc;

import com.revisionvehicular.backend.dtos.rc.UnidadesMedidaDTO;
import com.revisionvehicular.backend.entities.rc.UnidadMedida;
import com.revisionvehicular.backend.repositories.rc.IUnidadesMedidaRepository;
import com.revisionvehicular.backend.service.srtv.AuditoriaService;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UnidadMedidaServiceImpl implements IUnidadMedidaService {

    private final IUnidadesMedidaRepository repository;
    private final AuditoriaService auditoriaService;

    public UnidadMedidaServiceImpl(IUnidadesMedidaRepository repository, AuditoriaService auditoriaService) {
        this.repository = repository;
        this.auditoriaService = auditoriaService;
    }

    private UnidadesMedidaDTO toDTO(UnidadMedida entity) {
        UnidadesMedidaDTO dto = new UnidadesMedidaDTO();
        dto.setIdUnidadMedida(entity.getUmedidaid());
        dto.setNombre(entity.getNombre());
        dto.setSimbolo(entity.getSimbolo());
        dto.setDescripcion(entity.getDescripcion());
        dto.setEstado(entity.getEstado());
        return dto;
    }

    @Override
    public UnidadesMedidaDTO save(UnidadesMedidaDTO dto) {

        repository.insertarUnidadMedida(
                dto.getNombre(),
                dto.getSimbolo(),
                dto.getDescripcion(),
                dto.getEstado()
        );

        UnidadMedida unidad = repository.findAll()
                .stream()
                .filter(u -> u.getNombre().equals(dto.getNombre()))
                .findFirst()
                .orElseThrow(() ->
                        new RuntimeException("Error al insertar unidad de medida")
                );
        auditoriaService.registrar("INSERT", "UnidadMedida", "Creó unidad de medida \"" + dto.getNombre() + "\"");
        return toDTO(unidad);
    }

    @Override
    public UnidadesMedidaDTO update(Long id, UnidadesMedidaDTO dto) {

        repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Unidad de medida no encontrada con ID: " + id)
                );

        repository.actualizarUnidadMedida(
                id,
                dto.getNombre(),
                dto.getSimbolo(),
                dto.getDescripcion(),
                dto.getEstado()
        );

        UnidadMedida actualizada = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Error al actualizar unidad de medida")
                );
        auditoriaService.registrar("UPDATE", "UnidadMedida", "Actualizó unidad de medida \"" + dto.getNombre() + "\" (ID: " + id + ")");
        return toDTO(actualizada);
    }

    @Override
    public void delete(Long id) {
        if (repository.existsById(id)) {
            UnidadMedida u = repository.findById(id).orElse(null);
            String nombre = u != null ? u.getNombre() : "ID " + id;
            repository.deleteById(id);
            auditoriaService.registrar("DELETE", "UnidadMedida", "Eliminó unidad de medida \"" + nombre + "\" (ID: " + id + ")");
        } else {
            throw new RuntimeException("La unidad de medida no existe");
        }
    }

    @Override
    public UnidadesMedidaDTO findById(Long id) {

        UnidadMedida unidad = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Unidad de medida no encontrada con ID: " + id)
                );

        return toDTO(unidad);
    }

    @Override
    public List<UnidadesMedidaDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}
