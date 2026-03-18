package com.revisionvehicular.backend.service.rtv;

import com.revisionvehicular.backend.dtos.rtv.EquipoDTO;
import com.revisionvehicular.backend.entities.rtv.Equipos;
import com.revisionvehicular.backend.entities.rtv.LineasEquipo;
import com.revisionvehicular.backend.repositories.rtv.IEquipoRepository;
import com.revisionvehicular.backend.repositories.rtv.ILineasEquiposRepository;
import com.revisionvehicular.backend.service.srtv.AuditoriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EquiposServiceImpl implements IEquiposService {

    private final IEquipoRepository repository;
    private final ILineasEquiposRepository lineasEquiposRepository;
    private final AuditoriaService auditoriaService;

    @Autowired
    public EquiposServiceImpl(IEquipoRepository repository, ILineasEquiposRepository lineasEquiposRepository, AuditoriaService auditoriaService) {
        this.repository = repository;
        this.lineasEquiposRepository = lineasEquiposRepository;
        this.auditoriaService = auditoriaService;
    }

    @Override
    public EquipoDTO save(EquipoDTO dto) {
        if (dto.getLineaId() == null) {
            throw new RuntimeException("La línea (lineaId) es obligatoria para guardar el equipo.");
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
                dto.getSerialEquipo(),
                dto.getLineaId()
        );

        Equipos equipo = repository.findAll().stream().filter(e -> e.getSerialEquipo().equals(dto.getSerialEquipo())).findFirst()
                .orElseThrow(() -> new RuntimeException("Error al recuperar el equipo creado"));
        auditoriaService.registrar("INSERT", "Equipo", "Creó equipo \"" + dto.getEquipo() + "\" serial " + dto.getSerialEquipo());
        return toDTO(equipo);
    }

    @Override
    public EquipoDTO update(Long id, EquipoDTO dto) {
        if (dto.getLineaId() == null) {
            throw new RuntimeException("La línea (lineaId) es obligatoria para actualizar el equipo.");
        }

        if (!repository.existsById(id)) {
            throw new RuntimeException("Equipo no encontrado con ID: " + id);
        }

        Equipos equipoActual = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipo no encontrado"));

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
                dto.getSerialEquipo(),
                dto.getLineaId()
        );

        Equipos equipo = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error al recuperar el equipo actualizado"));
        auditoriaService.registrar("UPDATE", "Equipo", "Actualizó equipo \"" + dto.getEquipo() + "\" (ID: " + id + ")");
        return toDTO(equipo);
    }

    @Override
    public void delete(Long id) {
        if (repository.existsById(id)) {
            Equipos e = repository.findById(id).orElse(null);
            String detalle = e != null ? e.getEquipo() + " " + e.getSerialEquipo() : "ID " + id;
            repository.deleteById(id);
            auditoriaService.registrar("DELETE", "Equipo", "Eliminó equipo \"" + detalle + "\" (ID: " + id + ")");
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

        LineasEquipo lineaEquipo = lineasEquiposRepository
                .findFirstByEquipo_Equipoid(equipos.getEquipoid())
                .orElse(null);
        dto.setLineaId(lineaEquipo != null && lineaEquipo.getLinea() != null ? lineaEquipo.getLinea().getLineaid() : null);

        return dto;
    }
}