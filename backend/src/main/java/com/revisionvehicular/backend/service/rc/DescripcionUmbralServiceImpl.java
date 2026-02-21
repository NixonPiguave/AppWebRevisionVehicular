package com.revisionvehicular.backend.service.rc;

import com.revisionvehicular.backend.dtos.rc.DescripcionUmbralDTO;
import com.revisionvehicular.backend.entities.rc.DescripcionUmbral;
import com.revisionvehicular.backend.repositories.rc.IDescripcionUmbralRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;
@Service
public class DescripcionUmbralServiceImpl
        implements IDescripcionUmbralService {

    private final IDescripcionUmbralRepository repository;

    public DescripcionUmbralServiceImpl(
            IDescripcionUmbralRepository repository) {
        this.repository = repository;
    }
    @Transactional
    @Override
    public DescripcionUmbralDTO save(DescripcionUmbralDTO dto) {

        repository.spInsertarDescripcionUmbral(
                dto.getDescripcion(),
                dto.getEstado()
        );
        DescripcionUmbral entity = repository.findAll()
                .stream()
                .filter(d -> d.getDescripcion().equals(dto.getDescripcion()))
                .findFirst()
                .orElseThrow(() ->
                        new RuntimeException("Error al insertar descripción"));

        return toDTO(entity);
    }
    @Transactional
    @Override
    public DescripcionUmbralDTO update(Long id, DescripcionUmbralDTO dto) {

        if (!repository.existsById(id)) {
            throw new EntityNotFoundException(
                    "Descripción no encontrada con ID: " + id);
        }
        repository.spActualizarDescripcionUmbral(
                id,
                dto.getDescripcion(),
                dto.getEstado()
        );

        return findById(id);
    }
    @Override
    public DescripcionUmbralDTO findById(Long id) {

        DescripcionUmbral entity = repository.findById(id)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Descripción no encontrada con ID: " + id));
        return toDTO(entity);
    }
    @Override
    public List<DescripcionUmbralDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    @Override
    public void delete(Long id) {

        if (!repository.existsById(id)) {
            throw new EntityNotFoundException(
                    "Descripción no encontrada con ID: " + id);
        }

        repository.deleteById(id);
    }
    private DescripcionUmbralDTO toDTO(DescripcionUmbral entity) {

        DescripcionUmbralDTO dto = new DescripcionUmbralDTO();

        dto.setIdDescripcionUmbral(entity.getDescripUmbralId());
        dto.setDescripcion(entity.getDescripcion());
        dto.setEstado(entity.getEstado());
        return dto;
    }
}