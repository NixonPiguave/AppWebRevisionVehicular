package com.revisionvehicular.backend.service.rc;

import com.revisionvehicular.backend.dtos.rc.UmbralDTO;
import com.revisionvehicular.backend.entities.rc.Umbral;
import com.revisionvehicular.backend.repositories.rc.IUmbralRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UmbralServiceImpl implements IUmbralService {

    private final IUmbralRepository repository;

    public UmbralServiceImpl(IUmbralRepository repository) {
        this.repository = repository;
    }
    private void validarUmbral(UmbralDTO dto) {

        if (dto.getValorMin() == null || dto.getValorMax() == null) {
            throw new IllegalArgumentException("Los valores MIN y MAX son obligatorios");
        }
        BigDecimal cero = BigDecimal.ZERO;

        if (dto.getValorMin().compareTo(cero) < 0 ||
                dto.getValorMax().compareTo(cero) < 0) {

            throw new IllegalArgumentException("Los valores MIN y MAX no pueden ser negativos");
        }
        if (dto.getValorMin().compareTo(dto.getValorMax()) >= 0) {
            throw new IllegalArgumentException("El valor MIN debe ser menor que MAX");
        }
    }
    @Transactional
    @Override
    public UmbralDTO save(UmbralDTO dto) {
        validarUmbral(dto);
        repository.spInsertarUmbral(
                dto.getValorMin(),
                dto.getValorMax(),
                dto.getCalificacion(),
                dto.getIncValorMin(),
                dto.getIncValorMax(),
                dto.getIdUnidadMedida(),
                dto.getIdDescripcionUmbral(),
                dto.getEstado()
        );

        Umbral umbral = repository
                .findTopByUnidadMedida_UmedidaidAndValorMinAndValorMaxAndCalificacionOrderByUmbralidDesc(
                        dto.getIdUnidadMedida(),
                        dto.getValorMin(),
                        dto.getValorMax(),
                        dto.getCalificacion()
                )
                .orElseThrow(() -> new RuntimeException("Error al insertar umbral"));

        return toDTO(umbral);
    }

    @Transactional
    @Override
    public UmbralDTO update(Long id, UmbralDTO dto) {

        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Umbral no encontrado con ID: " + id);
        }
        validarUmbral(dto);
        repository.spActualizarUmbral(
                id,
                dto.getValorMin(),
                dto.getValorMax(),
                dto.getCalificacion(),
                dto.getIncValorMin(),
                dto.getIncValorMax(),
                dto.getIdUnidadMedida(),
                dto.getIdDescripcionUmbral(),
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
        dto.setCalificacion(umbral.getCalificacion());
        dto.setIncValorMin(umbral.getIncValorMin());
        dto.setIncValorMax(umbral.getIncValorMax());
        dto.setEstado(umbral.getEstado());

        if (umbral.getUnidadMedida() != null) {
            dto.setIdUnidadMedida(
                    umbral.getUnidadMedida().getUmedidaid()
            );
        }

        if (umbral.getDescripcionUmbral() != null) {
            dto.setIdDescripcionUmbral(
                    umbral.getDescripcionUmbral().getDescripUmbralId()
            );
        }

        return dto;
    }
}