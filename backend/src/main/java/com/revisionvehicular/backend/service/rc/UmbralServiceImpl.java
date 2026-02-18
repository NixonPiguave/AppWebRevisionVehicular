package com.revisionvehicular.backend.service.rc;

import com.revisionvehicular.backend.dtos.rc.UmbralDTO;
import com.revisionvehicular.backend.entities.rc.Umbral;
import com.revisionvehicular.backend.repositories.rc.IUmbralRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UmbralServiceImpl implements IUmbralService {

    private final IUmbralRepository repository;

    public UmbralServiceImpl(IUmbralRepository repository) {
        this.repository = repository;
    }

    @Transactional
    @Override
    public UmbralDTO save(UmbralDTO dto) {

        repository.spInsertarUmbral(
                dto.getValorMin(),
                dto.getValorMax(),
                dto.getIdUnidadMedida(),
                dto.getEstado()
        );

        // Recuperamos el último insertado por combinación lógica
        List<Umbral> lista = repository.findAll();

        Umbral umbral = lista.stream()
                .filter(u ->
                        u.getValorMin().equals(dto.getValorMin()) &&
                                u.getValorMax().equals(dto.getValorMax()) &&
                                u.getEstado().equals(dto.getEstado())
                )
                .reduce((first, second) -> second)
                .orElseThrow(() -> new EntityNotFoundException("Error al crear umbral"));

        return toDTO(umbral);
    }

    @Transactional
    @Override
    public UmbralDTO update(Long id, UmbralDTO dto) {

        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Umbral no encontrado con ID: " + id);
        }

        repository.spActualizarUmbral(
                id,
                dto.getValorMin(),
                dto.getValorMax(),
                dto.getIdUnidadMedida(),
                dto.getEstado()
        );

        Umbral actualizado = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Error al recuperar umbral actualizado"));

        return toDTO(actualizado);
    }

    @Override
    public UmbralDTO findById(Long id) {

        Umbral umbral = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Umbral no encontrado con ID: " + id));

        return toDTO(umbral);
    }

    @Override
    public List<UmbralDTO> findAll() {

        return repository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(Long id) {

        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Umbral no encontrado con ID: " + id);
        }

        repository.deleteById(id);
    }

    private UmbralDTO toDTO(Umbral umbral) {

        UmbralDTO dto = new UmbralDTO();

        dto.setIdUmbral(umbral.getUmbralid());
        dto.setValorMin(umbral.getValorMin());
        dto.setValorMax(umbral.getValorMax());
        dto.setEstado(umbral.getEstado());

        if (umbral.getUnidadMedida() != null) {
            dto.setIdUnidadMedida(
                    umbral.getUnidadMedida().getUmedidaid()
            );
        }

        return dto;
    }
}
