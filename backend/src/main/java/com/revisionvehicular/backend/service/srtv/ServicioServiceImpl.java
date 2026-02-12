package com.revisionvehicular.backend.service.srtv;

import com.revisionvehicular.backend.dtos.srtv.ServicioDTO;
import com.revisionvehicular.backend.entities.srtv.Servicio;
import com.revisionvehicular.backend.repositories.srtv.IServicioRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ServicioServiceImpl implements IServicioService {

    private final IServicioRepository repository;

    @Autowired
    public ServicioServiceImpl(IServicioRepository repository) {
        this.repository = repository;
    }

    @Transactional
    @Override
    public ServicioDTO save(ServicioDTO dto) {

        repository.insertarServicio(
                dto.getNombre(),
                dto.getDescripcion(),
                dto.getRequiereRevision(),
                dto.getGeneraMulta(),
                dto.getEstado()
        );
        Servicio servicio = repository.findAll().stream()
                .filter(s -> s.getNombre().equals(dto.getNombre()))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("Error al crear servicio"));
        return toDTO(servicio);
    }

    @Transactional
    @Override
    public ServicioDTO update(Long id, ServicioDTO dto) {

        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Servicio no encontrado con ID: " + id);
        }

        repository.actualizarServicio(
                id,
                dto.getNombre(),
                dto.getDescripcion(),
                dto.getRequiereRevision(),
                dto.getGeneraMulta(),
                dto.getEstado()
        );

        Servicio actualizado = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Error al recuperar servicio actualizado"));

        return toDTO(actualizado);
    }

    @Override
    public ServicioDTO findById(Long id) {
        Servicio servicio = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Servicio no encontrado con ID: " + id));
        return toDTO(servicio);
    }

    @Override
    public List<ServicioDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Servicio no encontrado con ID: " + id);
        }
        repository.deleteById(id);
    }

    private ServicioDTO toDTO(Servicio servicio) {
        ServicioDTO dto = new ServicioDTO();
        dto.setIdTipoTramite(servicio.getIdTipoTramite());
        dto.setNombre(servicio.getNombre());
        dto.setDescripcion(servicio.getDescripcion());
        dto.setRequiereRevision(servicio.getRequiereRevision());
        dto.setGeneraMulta(servicio.getGeneraMulta());
        dto.setEstado(servicio.getEstado());
        return dto;
    }
}
