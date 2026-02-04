package com.revisionvehicular.backend.service.ant;

import com.revisionvehicular.backend.dtos.ant.CalendarizacionMatriculacionDTO;

import java.util.List;

public interface ICalendarizacionService {
    CalendarizacionMatriculacionDTO save(CalendarizacionMatriculacionDTO dto);
    CalendarizacionMatriculacionDTO update(Long id, CalendarizacionMatriculacionDTO dto);
    void delete(Long id);
    CalendarizacionMatriculacionDTO findById(Long id);
    List<CalendarizacionMatriculacionDTO> findAll();
}