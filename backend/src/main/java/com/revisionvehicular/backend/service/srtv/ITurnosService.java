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
    List<TurnosDTO> findTurnosPagados();
    TurnosDTO actualizarMontoPagado(Long turnoId, BigDecimal montoPagado);
    BigDecimal obtenerTarifaPorTurno(Long turnoId);
    TurnosDTO cambiarEstado(Long turnoId, String nuevoEstado);
    List<MetodoInspeccionDTO> findMetodosInspeccionPendientes(Long turnoId);
}