package com.revisionvehicular.backend.service.cv;

import com.revisionvehicular.backend.dtos.cv.TipoCombustibleDTO;
import com.revisionvehicular.backend.entities.cv.TipoCombustible;
import com.revisionvehicular.backend.repositories.cv.ITipoCombustibleRepository;
import com.revisionvehicular.backend.service.srtv.AuditoriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TipoCombustibleServiceImpl implements ITipoCombustibleService {

    private final ITipoCombustibleRepository repository;
    private final AuditoriaService auditoriaService;

    @Autowired
    public TipoCombustibleServiceImpl(ITipoCombustibleRepository repository, AuditoriaService auditoriaService) {
        this.repository = repository;
        this.auditoriaService = auditoriaService;
    }

    private TipoCombustibleDTO toDTO(TipoCombustible tipo) {
        TipoCombustibleDTO dto = new TipoCombustibleDTO();
        dto.setId(tipo.getTipocombustibleid());
        dto.setNombre(tipo.getNombre());
        dto.setDescripcion(tipo.getDescripcion());
        dto.setEstado(tipo.getEstado());
        return dto;
    }

    @Override
    public TipoCombustibleDTO save(TipoCombustibleDTO dto) {

        repository.spInsertarTipoCombustible(
                dto.getNombre(),
                dto.getDescripcion(),
                dto.getEstado()
        );

        TipoCombustible tipo = repository.findByNombre(dto.getNombre())
                .orElseThrow(() ->
                        new RuntimeException("Tipo de combustible no encontrado")
                );
        auditoriaService.registrar("INSERT", "TipoCombustible", "Creó el tipo de combustible \"" + dto.getNombre() + "\"");
        return toDTO(tipo);
    }

    @Override
    public List<TipoCombustibleDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public TipoCombustibleDTO update(Long id, TipoCombustibleDTO dto) {

        TipoCombustible tipo = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Tipo de combustible " + id + " no encontrado")
                );

        repository.spModificarTipoCombustible(
                id,
                dto.getNombre(),
                dto.getDescripcion(),
                dto.getEstado()
        );

        TipoCombustible updated = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Error al actualizar el tipo de combustible")
                );
        auditoriaService.registrar("UPDATE", "TipoCombustible", "Actualizó el tipo de combustible \"" + dto.getNombre() + "\" (ID: " + id + ")");
        return toDTO(updated);
    }

    @Override
    public void delete(Long id) {
        if (repository.existsById(id)) {
            TipoCombustible t = repository.findById(id).orElse(null);
            String nombre = t != null ? t.getNombre() : "ID " + id;
            repository.deleteById(id);
            auditoriaService.registrar("DELETE", "TipoCombustible", "Eliminó el tipo de combustible \"" + nombre + "\" (ID: " + id + ")");
        } else {
            throw new RuntimeException("El tipo de combustible no existe");
        }
    }

    @Override
    public TipoCombustibleDTO findById(Long id) {

        TipoCombustible tipo = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Tipo de combustible no encontrado con ID: " + id)
                );

        return toDTO(tipo);
    }
}
