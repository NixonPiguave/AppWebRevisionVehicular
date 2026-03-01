package com.revisionvehicular.backend.service.cv;

import com.revisionvehicular.backend.dtos.cv.VehiculoDTO;
import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.repositories.cv.IVehiculoRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VehiculoServiceImpl implements IVehiculoService {

    private final IVehiculoRepository repository;

    public VehiculoServiceImpl(IVehiculoRepository repository) {
        this.repository = repository;
    }

    @Transactional
    @Override
    public VehiculoDTO save(VehiculoDTO dto) {

        repository.spInsertarVehiculo(
                dto.getPropietarioId(),
                dto.getMatricula(),
                dto.getChasis(),
                dto.getVin(),
                dto.getModeloVehiculoId(),
                dto.getAnioFabricacion(),
                dto.getColor(),
                dto.getEstado(),
                dto.getCapacidadPasajeros(),
                dto.getTipoVehiculoId(),
                dto.getCapCargaId(),
                dto.getAmbitoOperacionalId(),
                dto.getEjesId(),
                dto.getTraccionId(),
                dto.getTipoCombustibleId(),
                dto.getTipoMatriculaId(),
                dto.getSubcategoriaId()
        );

        Vehiculo vehiculo = repository.findByChasis(dto.getChasis())
                .orElseThrow(() -> new EntityNotFoundException("Error al crear vehículo"));

        return toDTO(vehiculo);
    }

    @Transactional
    @Override
    public VehiculoDTO update(Long id, VehiculoDTO dto) {

        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Vehículo no encontrado con ID: " + id);
        }

        repository.spModificarVehiculo(
                id,
                dto.getPropietarioId(),
                dto.getMatricula(),
                dto.getChasis(),
                dto.getVin(),
                dto.getModeloVehiculoId(),
                dto.getAnioFabricacion(),
                dto.getColor(),
                dto.getEstado(),
                dto.getCapacidadPasajeros(),
                dto.getTipoVehiculoId(),
                dto.getCapCargaId(),
                dto.getAmbitoOperacionalId(),
                dto.getEjesId(),
                dto.getTraccionId(),
                dto.getTipoCombustibleId(),
                dto.getTipoMatriculaId(),
                dto.getSubcategoriaId()
        );

        Vehiculo actualizado = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Error al recuperar vehículo actualizado"));

        return toDTO(actualizado);
    }

    @Override
    public VehiculoDTO findById(Long id) {
        Vehiculo vehiculo = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Vehículo no encontrado con ID: " + id));
        return toDTO(vehiculo);
    }

    @Override
    public List<VehiculoDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Vehículo no encontrado con ID: " + id);
        }
        repository.deleteById(id);
    }

    private VehiculoDTO toDTO(Vehiculo vehiculo) {

        VehiculoDTO dto = new VehiculoDTO();
        dto.setId(vehiculo.getVehiculoid());
        dto.setMatricula(vehiculo.getMatricula());
        dto.setChasis(vehiculo.getChasis());
        dto.setVin(vehiculo.getVin());
        dto.setAnioFabricacion(vehiculo.getAnioFabricacion());
        dto.setColor(vehiculo.getColor());
        dto.setEstado(vehiculo.getEstado());
        dto.setCapacidadPasajeros(vehiculo.getCantidad());

        dto.setPropietarioId(vehiculo.getPropietario() != null
                ? vehiculo.getPropietario().getIdPropietario()
                : null);

        dto.setModeloVehiculoId(vehiculo.getModeloVehiculo() != null
                ? vehiculo.getModeloVehiculo().getIdModelo()
                : null);

        dto.setTipoVehiculoId(vehiculo.getTipoVehiculo() != null
                ? vehiculo.getTipoVehiculo().getTipovehiculoid()
                : null);

        dto.setCapCargaId(vehiculo.getCapCarga() != null
                ? vehiculo.getCapCarga().getCapcargaid()
                : null);

        dto.setAmbitoOperacionalId(vehiculo.getAmbitoOperacional() != null
                ? vehiculo.getAmbitoOperacional().getAmbitoOperacionalId()
                : null);

        dto.setEjesId(vehiculo.getEjes() != null
                ? vehiculo.getEjes().getEjesid()
                : null);

        dto.setTraccionId(vehiculo.getTraccion() != null
                ? vehiculo.getTraccion().getTraccionid()
                : null);

        dto.setTipoCombustibleId(vehiculo.getTipoCombustible() != null
                ? vehiculo.getTipoCombustible().getTipocombustibleid()
                : null);

        dto.setTipoMatriculaId(vehiculo.getTipoMatricula() != null
                ? vehiculo.getTipoMatricula().getTipomatriculaid()
                : null);

        dto.setSubcategoriaId(vehiculo.getSubcategoria() != null
                ? vehiculo.getSubcategoria().getSubcategoriaid()
                : null);

        return dto;
    }
}