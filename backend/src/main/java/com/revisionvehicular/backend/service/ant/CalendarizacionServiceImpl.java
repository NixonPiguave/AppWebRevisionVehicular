package com.revisionvehicular.backend.service.ant;

import com.revisionvehicular.backend.dtos.ant.CalendarizacionMatriculacionDTO;
import com.revisionvehicular.backend.entities.ant.CalendarizacionMatriculacion;
import com.revisionvehicular.backend.repositories.ant.ICalendarizacionRepository;
import com.revisionvehicular.backend.service.srtv.AuditoriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CalendarizacionServiceImpl implements ICalendarizacionService {
    private final ICalendarizacionRepository repository;
    private final AuditoriaService auditoriaService;

    @Autowired
    public CalendarizacionServiceImpl(ICalendarizacionRepository repository, AuditoriaService auditoriaService) {
        this.repository = repository;
        this.auditoriaService = auditoriaService;
    }

    @Override
    public CalendarizacionMatriculacionDTO save(CalendarizacionMatriculacionDTO dto) {
        repository.insertarCalendarizacionMatriculacion(dto.getUltimoDigitoPlaca(), dto.getMes(), dto.getTipo(), dto.getEstado());
        CalendarizacionMatriculacion calendarizacion = repository.findAll().stream()
                .filter(c -> c.getUltimoDigitoPlaca().equals(dto.getUltimoDigitoPlaca()) && c.getMes().equals(dto.getMes()) && c.getTipo().equals(dto.getTipo()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Error al crear calendarización"));
        auditoriaService.registrar("INSERT", "CalendarizacionMatriculacion", "Creó calendarización placa " + dto.getUltimoDigitoPlaca() + " mes " + dto.getMes());
        return toDTO(calendarizacion);
    }

    @Override
    public CalendarizacionMatriculacionDTO findById(Long id) {
        CalendarizacionMatriculacion calendarizacion = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Calendarización no encontrada con ID: " + id));
        return toDTO(calendarizacion);
    }

    @Override
    public List<CalendarizacionMatriculacionDTO> findAll() {
        return repository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public CalendarizacionMatriculacionDTO update(Long id, CalendarizacionMatriculacionDTO dto) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Calendarización no encontrada con ID: " + id);
        }
        repository.actualizarCalendarizacionMatriculacion(id, dto.getUltimoDigitoPlaca(), dto.getMes(), dto.getTipo(), dto.getEstado());
        CalendarizacionMatriculacion calendarizacionActualizada = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error al recuperar la calendarización actualizada"));
        auditoriaService.registrar("UPDATE", "CalendarizacionMatriculacion", "Actualizó calendarización (ID: " + id + ")");
        return toDTO(calendarizacionActualizada);
    }

    @Override
    public void delete(Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            auditoriaService.registrar("DELETE", "CalendarizacionMatriculacion", "Eliminó calendarización ID " + id);
        } else {
            throw new RuntimeException("La calendarización no existe");
        }
    }

    private CalendarizacionMatriculacionDTO toDTO(CalendarizacionMatriculacion calendarizacion) {
        CalendarizacionMatriculacionDTO dto = new CalendarizacionMatriculacionDTO();
        dto.setIdCalendarizacion(calendarizacion.getIdCalendarizacion());
        dto.setUltimoDigitoPlaca(calendarizacion.getUltimoDigitoPlaca());
        dto.setMes(calendarizacion.getMes());
        dto.setTipo(calendarizacion.getTipo());
        dto.setEstado(calendarizacion.getEstado());
        return dto;
    }
}