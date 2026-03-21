package com.revisionvehicular.backend.service.ant;

import com.revisionvehicular.backend.dtos.ant.MultaRtvDetalleCompletoDTO;
import com.revisionvehicular.backend.dtos.ant.MultaRtvResumenFilaDTO;

import java.util.List;
import java.util.Optional;

public interface IMultaRtvConsultaService {

    List<MultaRtvResumenFilaDTO> listarResumenNoPresentacionRtvAnual();

    Optional<MultaRtvDetalleCompletoDTO> obtenerDetallePorVehiculo(Long vehiculoId);
}
