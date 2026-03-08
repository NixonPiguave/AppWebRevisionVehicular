package com.revisionvehicular.backend.service.cv;

import com.revisionvehicular.backend.dtos.cv.TipoMatriculaDTO;
import com.revisionvehicular.backend.entities.cv.TipoMatricula;
import com.revisionvehicular.backend.repositories.cv.ITipoMatriculaRepository;
import com.revisionvehicular.backend.service.srtv.AuditoriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TipoMatriculaServiceImpl implements ITipoMatriculaService {

    private final ITipoMatriculaRepository repository;
    private final AuditoriaService auditoriaService;

    @Autowired
    public TipoMatriculaServiceImpl(ITipoMatriculaRepository repository, AuditoriaService auditoriaService) {
        this.repository = repository;
        this.auditoriaService = auditoriaService;
    }

    private TipoMatriculaDTO toDTO(TipoMatricula tipo) {
        TipoMatriculaDTO dto = new TipoMatriculaDTO();
        dto.setId(tipo.getTipomatriculaid());
        dto.setNombre(tipo.getNombre());
        dto.setDescripcion(tipo.getDescripcion());
        dto.setEstado(tipo.getEstado());
        return dto;
    }

    @Override
    public TipoMatriculaDTO save(TipoMatriculaDTO dto) {

        repository.spInsertarTipoMatricula(
                dto.getNombre(),
                dto.getDescripcion(),
                dto.getEstado()
        );

        TipoMatricula tipo = repository.findByNombre(dto.getNombre())
                .orElseThrow(() ->
                        new RuntimeException("Tipo de matrícula no encontrado")
                );
        auditoriaService.registrar("INSERT", "TipoMatricula", "Creó el tipo de matrícula \"" + dto.getNombre() + "\"");
        return toDTO(tipo);
    }

    @Override
    public List<TipoMatriculaDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public TipoMatriculaDTO update(Long id, TipoMatriculaDTO dto) {

        TipoMatricula tipo = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Tipo de matrícula " + id + " no encontrado")
                );

        repository.spModificarTipoMatricula(
                id,
                dto.getNombre(),
                dto.getDescripcion(),
                dto.getEstado()
        );

        TipoMatricula updated = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Error al actualizar el tipo de matrícula")
                );
        auditoriaService.registrar("UPDATE", "TipoMatricula", "Actualizó el tipo de matrícula \"" + dto.getNombre() + "\" (ID: " + id + ")");
        return toDTO(updated);
    }

    @Override
    public void delete(Long id) {
        if (repository.existsById(id)) {
            TipoMatricula t = repository.findById(id).orElse(null);
            String nombre = t != null ? t.getNombre() : "ID " + id;
            repository.deleteById(id);
            auditoriaService.registrar("DELETE", "TipoMatricula", "Eliminó el tipo de matrícula \"" + nombre + "\" (ID: " + id + ")");
        } else {
            throw new RuntimeException("El tipo de matrícula no existe");
        }
    }

    @Override
    public TipoMatriculaDTO findById(Long id) {

        TipoMatricula tipo = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Tipo de matrícula no encontrado con ID: " + id)
                );

        return toDTO(tipo);
    }
}
