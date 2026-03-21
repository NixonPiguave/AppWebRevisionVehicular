package com.revisionvehicular.backend.service.ant;

import com.revisionvehicular.backend.constants.MultaRtvConstants;
import com.revisionvehicular.backend.dtos.ant.MultaRtvDetalleCompletoDTO;
import com.revisionvehicular.backend.dtos.ant.MultaRtvResumenFilaDTO;
import com.revisionvehicular.backend.dtos.ant.MultaTablaCompletaDTO;
import com.revisionvehicular.backend.dtos.ant.PropietarioVistaDTO;
import com.revisionvehicular.backend.dtos.ant.VehiculoVistaDTO;
import com.revisionvehicular.backend.entities.ant.Multa;
import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.pv.Propietario;
import com.revisionvehicular.backend.repositories.ant.IMultaRepository;
import com.revisionvehicular.backend.repositories.cv.IVehiculoRepository;
import com.revisionvehicular.backend.repositories.pv.IPropietarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MultaRtvConsultaServiceImpl implements IMultaRtvConsultaService {

    private final IMultaRepository multaRepository;
    private final IPropietarioRepository propietarioRepository;
    private final IVehiculoRepository vehiculoRepository;

    public MultaRtvConsultaServiceImpl(IMultaRepository multaRepository,
                                       IPropietarioRepository propietarioRepository,
                                       IVehiculoRepository vehiculoRepository) {
        this.multaRepository = multaRepository;
        this.propietarioRepository = propietarioRepository;
        this.vehiculoRepository = vehiculoRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<MultaRtvResumenFilaDTO> listarResumenNoPresentacionRtvAnual() {
        return multaRepository.resumenMultasRtvAnual(
                MultaRtvConstants.MOTIVO_FILTRO_CONTIENE_REVISION_TECNICA,
                MultaRtvConstants.MOTIVO_FILTRO_CONTIENE_ANUAL).stream()
                .map(row -> {
                    Propietario p = propietarioRepository.findById(row.getPropietarioId()).orElse(null);
                    Vehiculo v = vehiculoRepository.findByIdWithModeloMarca(row.getVehiculoId()).orElse(null);
                    String marcaModelo = "-";
                    if (v != null && v.getModeloVehiculo() != null) {
                        String mod = v.getModeloVehiculo().getNombre() != null
                                ? v.getModeloVehiculo().getNombre() : "";
                        String mar = v.getModeloVehiculo().getMarca() != null
                                && v.getModeloVehiculo().getMarca().getNombre() != null
                                ? v.getModeloVehiculo().getMarca().getNombre() : "";
                        marcaModelo = (mar + " " + mod).trim();
                        if (marcaModelo.isEmpty()) {
                            marcaModelo = "-";
                        }
                    }
                    return new MultaRtvResumenFilaDTO(
                            row.getVehiculoId(),
                            row.getPropietarioId(),
                            p != null ? p.getNombre() : null,
                            p != null ? p.getDocumentoIdentidad() : null,
                            v != null ? v.getMatricula() : null,
                            marcaModelo,
                            row.getRecargoAcumulado() != null ? row.getRecargoAcumulado() : BigDecimal.ZERO
                    );
                })
                .sorted(Comparator.comparing(MultaRtvResumenFilaDTO::getRecargoAcumulado,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<MultaRtvDetalleCompletoDTO> obtenerDetallePorVehiculo(Long vehiculoId) {
        if (vehiculoId == null) {
            return Optional.empty();
        }
        List<Multa> multas = multaRepository.findDetalleRtvAnualPorVehiculo(vehiculoId,
                MultaRtvConstants.MOTIVO_FILTRO_CONTIENE_REVISION_TECNICA,
                MultaRtvConstants.MOTIVO_FILTRO_CONTIENE_ANUAL);
        if (multas.isEmpty()) {
            return Optional.empty();
        }
        Multa primera = multas.get(0);
        Propietario prop = primera.getPropietario() != null
                ? propietarioRepository.findById(primera.getPropietario().getIdPropietario()).orElse(primera.getPropietario())
                : null;
        Vehiculo veh = vehiculoRepository.findByIdWithModeloMarca(vehiculoId).orElse(primera.getVehiculo());

        PropietarioVistaDTO pv = toPropietarioVista(prop);
        VehiculoVistaDTO vv = toVehiculoVista(veh);
        List<MultaTablaCompletaDTO> items = multas.stream().map(this::toMultaTabla).collect(Collectors.toList());

        return Optional.of(new MultaRtvDetalleCompletoDTO(pv, vv, items));
    }

    private PropietarioVistaDTO toPropietarioVista(Propietario p) {
        if (p == null) {
            return null;
        }
        return new PropietarioVistaDTO(
                p.getIdPropietario(),
                p.getDocumentoIdentidad(),
                p.getNombre(),
                p.getTelefono(),
                p.getCorreo(),
                p.getDireccion(),
                p.getFecharegistro()
        );
    }

    private VehiculoVistaDTO toVehiculoVista(Vehiculo v) {
        if (v == null) {
            return null;
        }
        String marca = null;
        String modelo = null;
        if (v.getModeloVehiculo() != null) {
            modelo = v.getModeloVehiculo().getNombre();
            if (v.getModeloVehiculo().getMarca() != null) {
                marca = v.getModeloVehiculo().getMarca().getNombre();
            }
        }
        return new VehiculoVistaDTO(
                v.getVehiculoid(),
                v.getMatricula(),
                v.getChasis(),
                v.getVin(),
                v.getCodigoMotor(),
                v.getAnioFabricacion(),
                marca,
                modelo
        );
    }

    private MultaTablaCompletaDTO toMultaTabla(Multa m) {
        MultaTablaCompletaDTO dto = new MultaTablaCompletaDTO();
        dto.setIdMulta(m.getIdMulta());
        if (m.getEntidadTransito() != null) {
            dto.setIdEntidad(m.getEntidadTransito().getIdEntidad());
            dto.setEntidadNombre(m.getEntidadTransito().getNombre());
        }
        if (m.getPropietario() != null) {
            dto.setIdPropietario(m.getPropietario().getIdPropietario());
        }
        if (m.getVehiculo() != null) {
            dto.setIdVehiculo(m.getVehiculo().getVehiculoid());
        }
        if (m.getEstadoMulta() != null) {
            dto.setIdEstadoMulta(m.getEstadoMulta().getEstadoMulta());
            dto.setEstadoMultaTipo(m.getEstadoMulta().getTipoMulta());
            dto.setEstadoMultaDescripcion(m.getEstadoMulta().getDescripcion());
        }
        dto.setNumeroCitacion(m.getNumeroCitacion());
        dto.setFechaEmision(m.getFechaEmision());
        dto.setFechaNotificacion(m.getFechaNotificacion());
        dto.setPais(m.getPais());
        dto.setCiudad(m.getCiudad());
        dto.setPuntos(m.getPuntos());
        dto.setMotivo(m.getMotivo());
        dto.setMonto(m.getMonto());
        dto.setEstado(m.getEstado());
        return dto;
    }
}
