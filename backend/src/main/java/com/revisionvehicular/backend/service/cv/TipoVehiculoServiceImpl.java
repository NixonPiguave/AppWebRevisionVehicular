package com.revisionvehicular.backend.service.cv;

import com.revisionvehicular.backend.dtos.cv.TipoVehiculoDTO;
import com.revisionvehicular.backend.entities.cv.TipoVehiculo;
import com.revisionvehicular.backend.repositories.cv.ITipoVehiculoRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TipoVehiculoServiceImpl implements ITipoVehiculoService {

    private final ITipoVehiculoRepository repository;

    public TipoVehiculoServiceImpl(ITipoVehiculoRepository repository) {
        this.repository = repository;
    }

    @Transactional
    @Override
    public TipoVehiculoDTO save(TipoVehiculoDTO dto) {

        repository.spInsertarTipoVehiculo(
                dto.getNombre(),
                dto.getDescripcion(),
                dto.getEstado(),
                dto.getClaseId()
        );

        TipoVehiculo tipoVehiculo = repository.findByNombre(dto.getNombre())
                .orElseThrow(() -> new EntityNotFoundException("Error al crear tipo de vehículo"));

        return toDTO(tipoVehiculo);
    }

    @Transactional
    @Override
    public TipoVehiculoDTO update(Long id, TipoVehiculoDTO dto) {

        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("TipoVehiculo no encontrado con ID: " + id);
        }

        repository.spModificarTipoVehiculo(
                id,
                dto.getNombre(),
                dto.getDescripcion(),
                dto.getEstado(),
                dto.getClaseId()
        );

        TipoVehiculo actualizado = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Error al recuperar tipoVehiculo actualizado"));

        return toDTO(actualizado);
    }
    @Override
    public TipoVehiculoDTO findById(Long id) {
        TipoVehiculo tipoVehiculo = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("TipoVehiculo no encontrado con ID: " + id));
        return toDTO(tipoVehiculo);
    }
    @Override
    public List<TipoVehiculoDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("TipoVehiculo no encontrado con ID: " + id);
        }
        repository.deleteById(id);
    }
    private TipoVehiculoDTO toDTO(TipoVehiculo entity) {

        TipoVehiculoDTO dto = new TipoVehiculoDTO();
        dto.setId(entity.getTipovehiculoid());
        dto.setNombre(entity.getNombre());
        dto.setDescripcion(entity.getDescripcion());
        dto.setEstado(entity.getEstado());

        if (entity.getClase() != null) {
            dto.setClaseId(entity.getClase().getClaseId());
        }
        return dto;
    }
}
