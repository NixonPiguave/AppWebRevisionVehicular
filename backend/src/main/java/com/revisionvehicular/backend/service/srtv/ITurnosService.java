package com.revisionvehicular.backend.service.srtv;

import com.revisionvehicular.backend.dtos.rtv.MetodoInspeccionDTO;
import com.revisionvehicular.backend.dtos.srtv.TurnosDTO;

import java.math.BigDecimal;
import java.util.List;

public interface ITurnosService {
    TurnosDTO save(TurnosDTO dto);
    TurnosDTO update(Long id, TurnosDTO dto);
    void delete(Long id);
    TurnosDTO findById(Long id);
    List<TurnosDTO> findAll();
    List<TurnosDTO> findTurnosPorEstado(String estado);
    List<TurnosDTO> findTurnosPorEstadoYServicio(String estado, Long servicioId);
    List<TurnosDTO> findTurnosPagados();
    List<TurnosDTO> findTurnosPagadosPorServicio(Long servicioId);
    List<TurnosDTO> findTurnosPagadosPorServicioYLinea(Long servicioId, Long lineaId);
    TurnosDTO actualizarMontoPagado(Long turnoId, BigDecimal montoPagado);
    BigDecimal obtenerTarifaPorTurno(Long turnoId);
    TurnosDTO cambiarEstado(Long turnoId, String nuevoEstado);
    List<MetodoInspeccionDTO> findMetodosInspeccionPendientes(Long turnoId);
}