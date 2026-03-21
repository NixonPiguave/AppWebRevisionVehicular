package com.revisionvehicular.backend.service.ant;

import com.revisionvehicular.backend.constants.MultaRtvConstants;
import com.revisionvehicular.backend.dtos.ant.MultaRtvDetalleCompletoDTO;
import com.revisionvehicular.backend.dtos.ant.MultaRtvDetalleLineaDTO;
import com.revisionvehicular.backend.dtos.ant.MultaRtvResumenFilaDTO;
import com.revisionvehicular.backend.entities.ant.Multa;
import com.revisionvehicular.backend.repositories.ant.IMultaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MultaRtvConsultaServiceImpl implements IMultaRtvConsultaService {

    private final IMultaRepository multaRepository;

    public MultaRtvConsultaServiceImpl(IMultaRepository multaRepository) {
        this.multaRepository = multaRepository;
    }

    @Override
    public List<MultaRtvResumenFilaDTO> listarResumenNoPresentacionRtvAnual() {
        return multaRepository
                .resumenMultasRtvAnual(
                        MultaRtvConstants.MOTIVO_FILTRO_REVISION_TECNICA,
                        MultaRtvConstants.MOTIVO_FILTRO_ANUAL)
                .stream()
                .map(row -> {
                    MultaRtvResumenFilaDTO dto = new MultaRtvResumenFilaDTO();
                    dto.setVehiculoId(row.getVehiculoId());
                    dto.setPropietarioId(row.getPropietarioId());
                    dto.setRecargoAcumulado(row.getRecargoAcumulado());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public Optional<MultaRtvDetalleCompletoDTO> obtenerDetallePorVehiculo(Long vehiculoId) {
        List<Multa> multas = multaRepository.findDetalleRtvAnualPorVehiculo(
                vehiculoId,
                MultaRtvConstants.MOTIVO_FILTRO_REVISION_TECNICA,
                MultaRtvConstants.MOTIVO_FILTRO_ANUAL);
        if (multas.isEmpty()) {
            return Optional.empty();
        }
        Multa primera = multas.get(0);
        MultaRtvDetalleCompletoDTO dto = new MultaRtvDetalleCompletoDTO();
        if (primera.getVehiculo() != null) {
            dto.setVehiculoId(primera.getVehiculo().getVehiculoid());
            dto.setPlaca(primera.getVehiculo().getMatricula());
        }
        if (primera.getPropietario() != null) {
            dto.setPropietarioId(primera.getPropietario().getIdPropietario());
            dto.setPropietarioDocumento(primera.getPropietario().getDocumentoIdentidad());
            dto.setPropietarioNombre(primera.getPropietario().getNombre());
        }
        dto.setMultas(multas.stream().map(this::mapearLinea).collect(Collectors.toList()));
        return Optional.of(dto);
    }

    private MultaRtvDetalleLineaDTO mapearLinea(Multa m) {
        MultaRtvDetalleLineaDTO linea = new MultaRtvDetalleLineaDTO();
        linea.setIdMulta(m.getIdMulta());
        if (m.getEntidadTransito() != null) {
            linea.setIdEntidadTransito(m.getEntidadTransito().getIdEntidad());
            linea.setEntidadNombre(m.getEntidadTransito().getNombre());
        }
        if (m.getEstadoMulta() != null) {
            linea.setIdEstadoMulta(m.getEstadoMulta().getEstadoMulta());
            linea.setEstadoMultaDescripcion(m.getEstadoMulta().getDescripcion());
        }
        linea.setNumeroCitacion(m.getNumeroCitacion());
        linea.setFechaEmision(m.getFechaEmision());
        linea.setFechaNotificacion(m.getFechaNotificacion());
        linea.setPais(m.getPais());
        linea.setCiudad(m.getCiudad());
        linea.setPuntos(m.getPuntos());
        linea.setMotivo(m.getMotivo());
        linea.setMonto(m.getMonto());
        linea.setEstado(m.getEstado());
        return linea;
    }
}
