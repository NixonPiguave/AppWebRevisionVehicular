package com.revisionvehicular.backend.service.rtv;

import com.revisionvehicular.backend.dtos.rtv.LineasDTO;
import com.revisionvehicular.backend.entities.rtv.Lineas;
import com.revisionvehicular.backend.repositories.rtv.ILineaRepository;
import com.revisionvehicular.backend.service.srtv.AuditoriaService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LineaServiceImpl implements ILineaService {

    private final ILineaRepository repository;
    private final AuditoriaService auditoriaService;

    public LineaServiceImpl(ILineaRepository repository, AuditoriaService auditoriaService) {
        this.repository = repository;
        this.auditoriaService = auditoriaService;
    }

    private LineasDTO toDTO(Lineas entity) {
        LineasDTO dto = new LineasDTO();
        dto.setId(entity.getLineaid());
        dto.setNombre(entity.getNombre());
        dto.setDescripcion(entity.getDescripcion());
        dto.setEstado(entity.getEstado());
        return dto;
    }

    @Override
    public LineasDTO save(LineasDTO dto) {

        repository.insertarLinea(
                dto.getNombre(),
                dto.getDescripcion(),
                dto.getEstado()
        );

        Lineas linea = repository.findAll()
                .stream()
                .filter(l -> l.getNombre().equals(dto.getNombre()))
                .findFirst()
                .orElseThrow(() ->
                        new RuntimeException("Error al insertar la línea")
                );
        auditoriaService.registrar("INSERT", "LineaInspeccion", "Creó línea de inspección \"" + dto.getNombre() + "\"");
        return toDTO(linea);
    }

    @Override
    public LineasDTO update(Long id, LineasDTO dto) {

        repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Línea no encontrada con ID: " + id)
                );

        repository.actualizarLinea(
                id,
                dto.getNombre(),
                dto.getDescripcion(),
                dto.getEstado()
        );

        Lineas actualizada = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Error al actualizar la línea")
                );
        auditoriaService.registrar("UPDATE", "LineaInspeccion", "Actualizó línea \"" + dto.getNombre() + "\" (ID: " + id + ")");
        return toDTO(actualizada);
    }

    @Override
    public void delete(Long id) {
        if (repository.existsById(id)) {
            Lineas l = repository.findById(id).orElse(null);
            String nombre = l != null ? l.getNombre() : "ID " + id;
            repository.deleteById(id);
            auditoriaService.registrar("DELETE", "LineaInspeccion", "Eliminó línea \"" + nombre + "\" (ID: " + id + ")");
        } else {
            throw new RuntimeException("La línea no existe");
        }
    }

    @Override
    public LineasDTO findById(Long id) {

        Lineas linea = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Línea no encontrada con ID: " + id)
                );

        return toDTO(linea);
    }

    @Override
    public List<LineasDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}
