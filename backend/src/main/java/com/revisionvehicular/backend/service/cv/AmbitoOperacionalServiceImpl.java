package com.revisionvehicular.backend.service.cv;

import com.revisionvehicular.backend.dtos.cv.AmbitoOperacionalDTO;
import com.revisionvehicular.backend.entities.cv.AmbitoOperacional;
import com.revisionvehicular.backend.repositories.cv.IAmbitoOperacionalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AmbitoOperacionalServiceImpl implements IAmbitoOperacional{

    private final IAmbitoOperacionalRepository repository;
    @Autowired
    public AmbitoOperacionalServiceImpl(IAmbitoOperacionalRepository repository) {
        this.repository = repository;
    }

    private AmbitoOperacionalDTO toDTO(AmbitoOperacional ambito) {
        AmbitoOperacionalDTO dto = new AmbitoOperacionalDTO();
        dto.setAmbito(ambito.getAmbito());
        dto.setId(ambito.getAmbitoOperacionalId());
        dto.setEstado(ambito.getEstado());
        dto.setDescripcion(ambito.getDescripcion());
        return dto;
    }
    @Override
    public AmbitoOperacionalDTO save(AmbitoOperacionalDTO dto) {
        repository.spInsertarAmbitoOperacional(
                dto.getEstado(),
                dto.getAmbito(),
                dto.getDescripcion()
        );
        AmbitoOperacional ambito = repository.getByAmbito(dto.getAmbito())
                .orElseThrow(() -> new RuntimeException("Ámbito operacional no encontrado"));
        return toDTO(ambito);
    }

    @Override
    public List<AmbitoOperacionalDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public AmbitoOperacionalDTO update(Long id, AmbitoOperacionalDTO dto) {

        AmbitoOperacional ambito = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Ámbito operacional " + id + " no encontrado")
                );

        ambito.setAmbito(dto.getAmbito());
        ambito.setEstado(dto.getEstado());
        ambito.setDescripcion(dto.getDescripcion());

        AmbitoOperacional updated = repository.save(ambito);
        return toDTO(updated);
    }

    @Override
    public void delete(Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
        } else {
            throw new RuntimeException("El ámbito operacional no existe");
        }
    }

    @Override
    public AmbitoOperacionalDTO findById(Long id) {

        AmbitoOperacional ambito = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Ámbito operacional no encontrado con ID: " + id)
                );
        return toDTO(ambito);
    }
}
