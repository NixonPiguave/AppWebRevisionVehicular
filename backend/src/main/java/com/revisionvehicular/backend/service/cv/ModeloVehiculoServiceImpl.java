package com.revisionvehicular.backend.service.cv;

import com.revisionvehicular.backend.dtos.cv.ModeloVehiculoDTO;
import com.revisionvehicular.backend.entities.cv.ModeloVehiculo;
import com.revisionvehicular.backend.repositories.cv.IModeloVehiculoRepository;
import com.revisionvehicular.backend.service.srtv.AuditoriaService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ModeloVehiculoServiceImpl implements IModeloVehiculoService {

    private final IModeloVehiculoRepository repository;
    private final AuditoriaService auditoriaService;

    public ModeloVehiculoServiceImpl(IModeloVehiculoRepository repository, AuditoriaService auditoriaService) {
        this.repository = repository;
        this.auditoriaService = auditoriaService;
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
        auditoriaService.registrar("INSERT", "Modelo", "Creó el modelo \"" + dto.getNombre() + "\"");
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
        auditoriaService.registrar("UPDATE", "Modelo", "Actualizó el modelo \"" + dto.getNombre() + "\" (ID: " + id + ")");
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
        ModeloVehiculo m = repository.findById(id).orElse(null);
        String nombre = m != null ? m.getNombre() : "ID " + id;
        repository.deleteById(id);
        auditoriaService.registrar("DELETE", "Modelo", "Eliminó el modelo \"" + nombre + "\" (ID: " + id + ")");
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
