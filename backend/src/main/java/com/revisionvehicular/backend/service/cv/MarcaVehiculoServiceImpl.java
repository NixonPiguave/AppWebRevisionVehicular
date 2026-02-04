package com.revisionvehicular.backend.service.cv;

import com.revisionvehicular.backend.dtos.cv.MarcaVehiculoDTO;
import com.revisionvehicular.backend.entities.cv.MarcaVehiculo;
import com.revisionvehicular.backend.repositories.cv.IMarcaVehiculoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MarcaVehiculoServiceImpl implements IMarcaVehiculoService {

    private final IMarcaVehiculoRepository repository;

    @Autowired
    public MarcaVehiculoServiceImpl(IMarcaVehiculoRepository repository) {
        this.repository = repository;
    }

    private MarcaVehiculoDTO toDTO(MarcaVehiculo marca) {
        MarcaVehiculoDTO dto = new MarcaVehiculoDTO();
        dto.setId(marca.getIdMarca());
        dto.setNombre(marca.getNombre());
        dto.setEmpresa(marca.getEmpresa());
        dto.setPaisOrigen(marca.getPaisOrigen());
        dto.setGrupoAutomotriz(marca.getGrupoAutomotriz());
        dto.setFechaAlta(marca.getFechaAlta());
        dto.setFechaBaja(marca.getFechaBaja());
        dto.setLogoUrl(marca.getLogoUrl());
        dto.setEstado(marca.getEstado());
        return dto;
    }

    @Override
    public MarcaVehiculoDTO save(MarcaVehiculoDTO dto) {

        repository.spInsertarMarcaVehiculo(
                dto.getNombre(),
                dto.getEmpresa(),
                dto.getPaisOrigen(),
                dto.getGrupoAutomotriz(),
                dto.getFechaAlta(),
                dto.getFechaBaja(),
                dto.getLogoUrl(),
                dto.getEstado()
        );

        MarcaVehiculo marca = repository.findByNombre(dto.getNombre())
                .orElseThrow(() ->
                        new RuntimeException("Marca de vehículo no encontrada")
                );

        return toDTO(marca);
    }

    @Override
    public List<MarcaVehiculoDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public MarcaVehiculoDTO update(Long id, MarcaVehiculoDTO dto) {

        MarcaVehiculo marca = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Marca de vehículo " + id + " no encontrada")
                );

        repository.spModificarMarcaVehiculo(
                id,
                dto.getNombre(),
                dto.getEmpresa(),
                dto.getPaisOrigen(),
                dto.getGrupoAutomotriz(),
                dto.getFechaAlta(),
                dto.getFechaBaja(),
                dto.getLogoUrl(),
                dto.getEstado()
        );

        MarcaVehiculo updated = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Error al actualizar la marca de vehículo")
                );

        return toDTO(updated);
    }

    @Override
    public void delete(Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
        } else {
            throw new RuntimeException("La marca de vehículo no existe");
        }
    }

    @Override
    public MarcaVehiculoDTO findById(Long id) {

        MarcaVehiculo marca = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Marca de vehículo no encontrada con ID: " + id)
                );

        return toDTO(marca);
    }
}
