package com.revisionvehicular.backend.service.rtv;

import com.revisionvehicular.backend.dtos.rtv.BajaVehiculoDTO;
import com.revisionvehicular.backend.entities.rtv.BajaVehiculo;
import com.revisionvehicular.backend.repositories.rtv.IBajaVehiculoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BajaVehiculoServiceImpl implements IBajaVehiculoService {

    private final IBajaVehiculoRepository repository;

    public BajaVehiculoServiceImpl(IBajaVehiculoRepository repository) {
        this.repository = repository;
    }

    private BajaVehiculoDTO toDTO(BajaVehiculo entity) {
        BajaVehiculoDTO dto = new BajaVehiculoDTO();
        dto.setIdBaja(entity.getIdBaja());
        dto.setNumeroTramite(entity.getNumeroTramite());
        dto.setMotivoBaja(entity.getMotivoBaja());
        dto.setDescripcionMotivo(entity.getDescripcionMotivo());
        dto.setEmpresaChatarrizado(entity.getEmpresaChatarrizado());
        dto.setCertChatarrizado(entity.getCertChatarrizado());
        dto.setFechaChatarrizado(entity.getFechaChatarrizado());
        dto.setOrdenJudicial(entity.getOrdenJudicial());
        dto.setConstanciaPolicial(entity.getConstanciaPolicial());
        dto.setNotificadoSri(entity.getNotificadoSri());
        dto.setFechaNotificacionSri(entity.getFechaNotificacionSri());
        dto.setEstado(entity.getEstado());
        dto.setFechaSolicitud(entity.getFechaSolicitud());
        dto.setFechaConclusion(entity.getFechaConclusion());

        if (entity.getTramite() != null) {
            dto.setTramiteId(entity.getTramite().getIdTramite());
        }
        if (entity.getVehiculo() != null) {
            dto.setVehiculoId(entity.getVehiculo().getVehiculoid());
        }
        if (entity.getPropietario() != null) {
            dto.setPropietarioId(entity.getPropietario().getIdPropietario());
        }
        if (entity.getEntidad() != null) {
            dto.setEntidadId(entity.getEntidad().getIdEntidad());
        }
        if (entity.getUsuario() != null) {
            dto.setUsuarioId(entity.getUsuario().getUsuarioId());
        }
        if (entity.getInspeccion1() != null) {
            dto.setInspeccion1Id(entity.getInspeccion1().getInspeccion_id());
        }
        if (entity.getInspeccion2() != null) {
            dto.setInspeccion2Id(entity.getInspeccion2().getInspeccion_id());
        }
        if (entity.getInspeccion3() != null) {
            dto.setInspeccion3Id(entity.getInspeccion3().getInspeccion_id());
        }

        return dto;
    }

    @Override
    public BajaVehiculoDTO save(BajaVehiculoDTO dto) {
        repository.insertarBajaVehiculo(
                dto.getTramiteId(),
                dto.getVehiculoId(),
                dto.getPropietarioId(),
                dto.getEntidadId(),
                dto.getUsuarioId(),
                dto.getNumeroTramite(),
                dto.getMotivoBaja(),
                dto.getDescripcionMotivo(),
                dto.getInspeccion1Id(),
                dto.getInspeccion2Id(),
                dto.getInspeccion3Id(),
                dto.getEmpresaChatarrizado(),
                dto.getCertChatarrizado(),
                dto.getFechaChatarrizado(),
                dto.getOrdenJudicial(),
                dto.getConstanciaPolicial(),
                dto.getNotificadoSri(),
                dto.getFechaNotificacionSri(),
                dto.getEstado(),
                dto.getFechaSolicitud(),
                dto.getFechaConclusion()
        );

        BajaVehiculo creado = repository.findAll().stream()
                .filter(b -> b.getNumeroTramite().equals(dto.getNumeroTramite()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Error al insertar baja de vehículo"));

        return toDTO(creado);
    }

    @Override
    public BajaVehiculoDTO update(Long id, BajaVehiculoDTO dto) {
        BajaVehiculo existente = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Baja de vehículo no encontrada con ID: " + id));

        repository.actualizarBajaVehiculo(
                id,
                dto.getTramiteId(),
                dto.getVehiculoId(),
                dto.getPropietarioId(),
                dto.getEntidadId(),
                dto.getUsuarioId(),
                dto.getNumeroTramite(),
                dto.getMotivoBaja(),
                dto.getDescripcionMotivo(),
                dto.getInspeccion1Id(),
                dto.getInspeccion2Id(),
                dto.getInspeccion3Id(),
                dto.getEmpresaChatarrizado(),
                dto.getCertChatarrizado(),
                dto.getFechaChatarrizado(),
                dto.getOrdenJudicial(),
                dto.getConstanciaPolicial(),
                dto.getNotificadoSri(),
                dto.getFechaNotificacionSri(),
                dto.getEstado(),
                dto.getFechaSolicitud(),
                dto.getFechaConclusion()
        );

        BajaVehiculo actualizado = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error al actualizar baja de vehículo"));

        return toDTO(actualizado);
    }

    @Override
    public void delete(Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
        } else {
            throw new RuntimeException("La baja de vehículo no existe");
        }
    }

    @Override
    public BajaVehiculoDTO findById(Long id) {
        BajaVehiculo entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Baja de vehículo no encontrada con ID: " + id));
        return toDTO(entity);
    }

    @Override
    public List<BajaVehiculoDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}

