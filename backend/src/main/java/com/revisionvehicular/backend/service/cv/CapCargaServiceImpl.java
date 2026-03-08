package com.revisionvehicular.backend.service.cv;

import com.revisionvehicular.backend.dtos.cv.CapCargaDTO;
import com.revisionvehicular.backend.entities.cv.CapCarga;
import com.revisionvehicular.backend.repositories.cv.ICapCargaRepository;
import com.revisionvehicular.backend.service.srtv.AuditoriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CapCargaServiceImpl implements ICapCargaService {

    private final ICapCargaRepository repository;
    private final AuditoriaService auditoriaService;

    @Autowired
    public CapCargaServiceImpl(ICapCargaRepository repository, AuditoriaService auditoriaService) {
        this.repository = repository;
        this.auditoriaService = auditoriaService;
    }
    private CapCargaDTO toDTO(CapCarga capCarga) {
        CapCargaDTO dto = new CapCargaDTO();
        dto.setId(capCarga.getCapcargaid());
        dto.setCapacidad(capCarga.getCapacidad());
        dto.setUnidad(capCarga.getUnidad());
        dto.setDescripcion(capCarga.getDescripcion());
        dto.setEstado(capCarga.getEstado());
        return dto;
    }
    @Override
    public CapCargaDTO save(CapCargaDTO dto) {

        repository.spCrearCapCarga(
                dto.getCapacidad(),
                dto.getUnidad(),
                dto.getDescripcion(),
                dto.getEstado()
        );
        CapCarga capCarga = repository
                .getCapCargasByCapacidad(dto.getCapacidad())
                .orElseThrow(() ->
                        new RuntimeException("Capacidad de carga no encontrada")
                );
        auditoriaService.registrar("INSERT", "CapacidadCarga", "Creó capacidad de carga \"" + dto.getCapacidad() + " " + (dto.getUnidad() != null ? dto.getUnidad() : "") + "\"");
        return toDTO(capCarga);
    }
    @Override
    public List<CapCargaDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    @Override
    public CapCargaDTO update(Long id, CapCargaDTO dto) {

        CapCarga capCarga = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Capacidad de carga " + id + " no encontrada")
                );

        repository.spModificarCapCarga(
                id,
                dto.getCapacidad(),
                dto.getUnidad(),
                dto.getDescripcion(),
                dto.getEstado()
        );
        CapCarga updated = repository.findById(id).orElseThrow(() ->
                        new RuntimeException("Error al actualizar la capacidad de carga")
                );
        auditoriaService.registrar("UPDATE", "CapacidadCarga", "Actualizó capacidad de carga (ID: " + id + ")");
        return toDTO(updated);
    }
    @Override
    public void delete(Long id) {
        if (repository.existsById(id)) {
            CapCarga c = repository.findById(id).orElse(null);
            String detalle = c != null ? c.getCapacidad() + " " + (c.getUnidad() != null ? c.getUnidad() : "") : "ID " + id;
            repository.deleteById(id);
            auditoriaService.registrar("DELETE", "CapacidadCarga", "Eliminó capacidad de carga \"" + detalle + "\" (ID: " + id + ")");
        } else {
            throw new RuntimeException("La capacidad de carga no existe");
        }
    }
    @Override
    public CapCargaDTO findById(Long id) {

        CapCarga capCarga = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Capacidad de carga no encontrada con ID: " + id)
                );

        return toDTO(capCarga);
    }
}
