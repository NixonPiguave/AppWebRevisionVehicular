package com.revisionvehicular.backend.service.cv;

import com.revisionvehicular.backend.dtos.cv.ModeloVehiculoDTO;
import com.revisionvehicular.backend.entities.cv.ModeloVehiculo;
import com.revisionvehicular.backend.repositories.cv.IModeloVehiculoRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ModeloVehiculoServiceImpl implements IModeloVehiculoService {

    private final IModeloVehiculoRepository repository;

    public ModeloVehiculoServiceImpl(IModeloVehiculoRepository repository) {
        this.repository = repository;
    }

    @Transactional
    @Override
    public ModeloVehiculoDTO save(ModeloVehiculoDTO dto) {

        repository.spInsertarModeloVehiculo(
                dto.getNombre(),
                dto.getAnioDesde(),
                dto.getAnioHasta(),
                dto.getEstado(),
                dto.getMarcaId()
        );

        ModeloVehiculo modelo = repository
                .findByNombreAndMarca_IdMarca(dto.getNombre(), dto.getMarcaId())
                .orElseThrow(() -> new EntityNotFoundException("Error al crear modelo vehículo"));

        return toDTO(modelo);
    }

    @Transactional
    @Override
    public ModeloVehiculoDTO update(Long id, ModeloVehiculoDTO dto) {

        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Modelo no encontrado con ID: " + id);
        }

        repository.spModificarModeloVehiculo(
                id,
                dto.getNombre(),
                dto.getAnioDesde(),
                dto.getAnioHasta(),
                dto.getEstado(),
                dto.getMarcaId()
        );

        ModeloVehiculo actualizado = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Error al recuperar modelo actualizado"));

        return toDTO(actualizado);
    }

    @Override
    public ModeloVehiculoDTO findById(Long id) {
        ModeloVehiculo modelo = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Modelo no encontrado con ID: " + id));
        return toDTO(modelo);
    }

    @Override
    public List<ModeloVehiculoDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ModeloVehiculoDTO> findByMarca(Long idMarca) {
        return repository.findByMarcaIdMarca(idMarca)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Modelo no encontrado con ID: " + id);
        }
        repository.deleteById(id);
    }

    private ModeloVehiculoDTO toDTO(ModeloVehiculo modelo) {
        ModeloVehiculoDTO dto = new ModeloVehiculoDTO();
        dto.setId(modelo.getIdModelo());
        dto.setNombre(modelo.getNombre());
        dto.setAnioDesde(modelo.getAnioDesde());
        dto.setAnioHasta(modelo.getAnioHasta());
        dto.setEstado(modelo.getEstado());

        if (modelo.getMarca() != null) {
            dto.setMarcaId(modelo.getMarca().getIdMarca());
        }

        return dto;
    }
}
