package com.revisionvehicular.backend.service.cv;

import com.revisionvehicular.backend.dtos.cv.MarcaVehiculoDTO;
import com.revisionvehicular.backend.entities.cv.MarcaVehiculo;
import com.revisionvehicular.backend.repositories.cv.IMarcaVehiculoRepository;
import com.revisionvehicular.backend.service.srtv.AuditoriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MarcaVehiculoServiceImpl implements IMarcaVehiculoService {

    private final IMarcaVehiculoRepository repository;
    private final AuditoriaService auditoriaService;

    @Autowired
    public MarcaVehiculoServiceImpl(IMarcaVehiculoRepository repository, AuditoriaService auditoriaService) {
        this.repository = repository;
        this.auditoriaService = auditoriaService;
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
        auditoriaService.registrar("INSERT", "Marca", "Creó la marca \"" + dto.getNombre() + "\"");
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
        auditoriaService.registrar("UPDATE", "Marca", "Actualizó la marca \"" + dto.getNombre() + "\" (ID: " + id + ")");
        return toDTO(updated);
    }

    @Override
    public void delete(Long id) {
        if (repository.existsById(id)) {
            MarcaVehiculo m = repository.findById(id).orElse(null);
            String nombre = m != null ? m.getNombre() : "ID " + id;
            repository.deleteById(id);
            auditoriaService.registrar("DELETE", "Marca", "Eliminó la marca \"" + nombre + "\" (ID: " + id + ")");
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
