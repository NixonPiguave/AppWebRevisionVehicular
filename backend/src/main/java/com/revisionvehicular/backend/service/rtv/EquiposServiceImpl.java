package com.revisionvehicular.backend.service.rtv;

import com.revisionvehicular.backend.dtos.rtv.EquipoDTO;
import com.revisionvehicular.backend.entities.rtv.Equipos;
import com.revisionvehicular.backend.repositories.rtv.IEquipoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EquiposServiceImpl implements IEquiposService {

    private final IEquipoRepository repository;

    @Autowired
    public EquiposServiceImpl(IEquipoRepository repository) {
        this.repository = repository;
    }

    @Override
    public EquipoDTO save(EquipoDTO dto) {

        //  VALIDAR SERIAL ÚNICO ANTES DE INSERTAR
        if (repository.existsBySerialEquipo(dto.getSerialEquipo())) {
            throw new RuntimeException("El número de serie ya está registrado");
        }

        //  VALIDAR CÓDIGO INTERNO ÚNICO ANTES DE INSERTAR
        if (repository.existsByCodigoInterno(dto.getCodigoInterno())) {
            throw new RuntimeException("El código interno ya está registrado");
        }

        // Insertar mediante stored procedure
        repository.spInsertarEquipo(
                dto.getInfluencia(),
                dto.getUltimaCalibracion(),
                dto.getUltimoMantenimiento(),
                dto.getEstado(),
                dto.getCodigoInterno(),
                dto.getEquipo(),
                dto.getModelo(),
                dto.getSerialEquipo()
        );

        Equipos equipo = repository.findById(dto.getEquipoid())
                .orElseThrow(() -> new RuntimeException("Error al recuperar el equipo creado"));

        return toDTO(equipo);
    }

    @Override
    public EquipoDTO update(Long id, EquipoDTO dto) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Equipo no encontrado con ID: " + id);
        }

        //  VALIDAR SERIAL ÚNICO (solo si cambió)
        Equipos equipoActual = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipo no encontrado"));

        if (!equipoActual.getSerialEquipo().equals(dto.getSerialEquipo())) {
            if (repository.existsBySerialEquipo(dto.getSerialEquipo())) {
                throw new RuntimeException("El número de serie ya está registrado");
            }
        }

        // VALIDAR CÓDIGO INTERNO ÚNICO (solo si cambió)
        if (!equipoActual.getCodigoInterno().equals(dto.getCodigoInterno())) {
            if (repository.existsByCodigoInterno(dto.getCodigoInterno())) {
                throw new RuntimeException("El código interno ya está registrado");
            }
        }

        repository.spActualizarEquipo(
                id,
                dto.getInfluencia(),
                dto.getUltimaCalibracion(),
                dto.getUltimoMantenimiento(),
                dto.getEstado(),
                dto.getCodigoInterno(),
                dto.getEquipo(),
                dto.getModelo(),
                dto.getSerialEquipo()
        );

        Equipos equipo = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error al recuperar el equipo actualizado"));

        return toDTO(equipo);
    }

    @Override
    public void delete(Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
        } else {
            throw new RuntimeException("El equipo no existe");
        }
    }

    @Override
    public EquipoDTO findById(Long id) {
        Equipos equipos = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipo no encontrado con id: " + id));
        return toDTO(equipos);
    }

    @Override
    public List<EquipoDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private EquipoDTO toDTO(Equipos equipos) {
        EquipoDTO dto = new EquipoDTO();
        dto.setEquipo(equipos.getEquipo());
        dto.setModelo(equipos.getModelo());
        dto.setEstado(equipos.getEstado());
        dto.setInfluencia(equipos.getInfluencia());
        dto.setEquipoid(equipos.getEquipoid());
        dto.setSerialEquipo(equipos.getSerialEquipo());
        dto.setCodigoInterno(equipos.getCodigoInterno());
        dto.setUltimaCalibracion(equipos.getUltimaCalibracion());
        dto.setUltimoMantenimiento(equipos.getUltimoMantenimiento());
        return dto;
    }
}