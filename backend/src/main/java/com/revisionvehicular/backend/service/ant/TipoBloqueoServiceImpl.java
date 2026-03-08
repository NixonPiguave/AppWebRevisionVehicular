package com.revisionvehicular.backend.service.ant;

import com.revisionvehicular.backend.dtos.ant.TipoBloqueoDTO;
import com.revisionvehicular.backend.entities.ant.TipoBloqueo;
import com.revisionvehicular.backend.repositories.ant.ITipoBloqueoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TipoBloqueoServiceImpl implements ITipoBloqueoService {

    private final ITipoBloqueoRepository repository;

    public TipoBloqueoServiceImpl(ITipoBloqueoRepository repository) {
        this.repository = repository;
    }

    private TipoBloqueoDTO toDTO(TipoBloqueo entity) {
        TipoBloqueoDTO dto = new TipoBloqueoDTO();
        dto.setIdTipoBloqueo(entity.getIdTipoBloqueo());
        dto.setCodigo(entity.getCodigo());
        dto.setNombre(entity.getNombre());
        dto.setDescripcion(entity.getDescripcion());
        dto.setDocActivacion(entity.getDocActivacion());
        dto.setDocDesactivacion(entity.getDocDesactivacion());
        dto.setInstAutorizada(entity.getInstAutorizada());
        dto.setEstado(entity.getEstado());
        return dto;
    }

    @Override
    public List<TipoBloqueoDTO> findAll() {
        return repository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public TipoBloqueoDTO findById(Long id) {
        TipoBloqueo entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tipo de bloqueo no encontrado con ID: " + id));
        return toDTO(entity);
    }

    @Override
    public List<String> findDistinctInstituciones() {
        return repository.findDistinctInstAutorizada();
    }
}
