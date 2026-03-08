package com.revisionvehicular.backend.service.cv;

import com.revisionvehicular.backend.dtos.cv.EjesDTO;
import com.revisionvehicular.backend.entities.cv.Ejes;
import com.revisionvehicular.backend.repositories.cv.IEjesRepository;
import com.revisionvehicular.backend.service.srtv.AuditoriaService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EjesServiceImpl implements IEjesService {

    private final IEjesRepository repository;
    private final AuditoriaService auditoriaService;

    public EjesServiceImpl(IEjesRepository repository, AuditoriaService auditoriaService) {
        this.repository = repository;
        this.auditoriaService = auditoriaService;
    }

    private EjesDTO toDTO(Ejes ejes) {
        EjesDTO dto = new EjesDTO();
        dto.setId(ejes.getEjesid());
        dto.setCantidad(ejes.getCantidad());
        dto.setDescripcion(ejes.getDescripcion());
        dto.setEstado(ejes.getEstado());
        return dto;
    }

    @Override
    public EjesDTO save(EjesDTO dto) {

        repository.spInsertarEjes(
                dto.getCantidad(),
                dto.getDescripcion(),
                dto.getEstado()
        );

        Ejes ejes = repository.getByCantidad(dto.getCantidad())
                .orElseThrow(() ->
                        new RuntimeException("Error al insertar ejes")
                );
        auditoriaService.registrar("INSERT", "Ejes", "Creó ejes cantidad \"" + dto.getCantidad() + "\"");
        return toDTO(ejes);
    }

    @Override
    public EjesDTO update(Long id, EjesDTO dto) {

        Ejes existente = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Ejes no encontrados con ID: " + id)
                );

        repository.spModificarEjes(
                id,
                dto.getCantidad(),
                dto.getDescripcion(),
                dto.getEstado()
        );

        Ejes actualizado = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Error al actualizar ejes")
                );
        auditoriaService.registrar("UPDATE", "Ejes", "Actualizó ejes (ID: " + id + ")");
        return toDTO(actualizado);
    }

    @Override
    public void delete(Long id) {
        if (repository.existsById(id)) {
            Ejes e = repository.findById(id).orElse(null);
            String detalle = e != null ? "cantidad " + e.getCantidad() : "ID " + id;
            repository.deleteById(id);
            auditoriaService.registrar("DELETE", "Ejes", "Eliminó ejes " + detalle + " (ID: " + id + ")");
        } else {
            throw new RuntimeException("Los ejes no existen");
        }
    }

    @Override
    public EjesDTO findById(Long id) {

        Ejes ejes = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Ejes no encontrados con ID: " + id)
                );

        return toDTO(ejes);
    }

    @Override
    public List<EjesDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}
