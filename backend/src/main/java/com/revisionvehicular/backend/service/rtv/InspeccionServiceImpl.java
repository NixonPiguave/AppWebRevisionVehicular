package com.revisionvehicular.backend.service.rtv;

import com.revisionvehicular.backend.dtos.rtv.CrearInspeccionRequest;
import com.revisionvehicular.backend.dtos.rtv.DetalleInspeccionDTO;
import com.revisionvehicular.backend.dtos.rtv.InspeccionDTO;
import com.revisionvehicular.backend.entities.rtv.Inspeccion;
import com.revisionvehicular.backend.repositories.rtv.IDetalleInspeccionRepository;
import com.revisionvehicular.backend.repositories.rtv.IInspeccionRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InspeccionServiceImpl implements IInspeccionService {

    private static final Long UMBRAL_DEFAULT = 1L;
    private static final String ESTADO_ACTIVO = "A";
    private static final String RESULTADO_PENDIENTE = "PENDIENTE";

    private final IInspeccionRepository inspeccionRepository;
    private final IDetalleInspeccionRepository detalleRepository;

    public InspeccionServiceImpl(IInspeccionRepository inspeccionRepository,
                                 IDetalleInspeccionRepository detalleRepository) {
        this.inspeccionRepository = inspeccionRepository;
        this.detalleRepository = detalleRepository;
    }

    @Override
    @Transactional
    public InspeccionDTO crear(CrearInspeccionRequest request) {
        if (request.getVehiculoId() == null) {
            throw new IllegalArgumentException("vehiculoId es obligatorio");
        }
        if (request.getMetodoInspeccionId() == null) {
            throw new IllegalArgumentException("metodoInspeccionId es obligatorio");
        }
        if (request.getUsuarioId() == null) {
            throw new IllegalArgumentException("usuarioId es obligatorio");
        }

        Long lineaId = request.getLineaId() != null ? request.getLineaId() : 1L;

        inspeccionRepository.insertarInspeccion(
                LocalDateTime.now(),
                RESULTADO_PENDIENTE,
                request.getObservaciones(),
                request.getVehiculoId(),
                lineaId,
                request.getUsuarioId(),
                ESTADO_ACTIVO
        );

        Inspeccion inspeccion = inspeccionRepository.findUltimaPorVehiculo(request.getVehiculoId());
        if (inspeccion == null) {
            throw new RuntimeException("No se pudo recuperar la inspección recién creada");
        }

        List<Long> defectosIds = request.getDefectosIds();
        if (defectosIds != null && !defectosIds.isEmpty()) {
            Long umbralId = UMBRAL_DEFAULT;
            for (Long defectoId : defectosIds) {
                if (defectoId != null && defectoId > 0) {
                    detalleRepository.insertarDetalleInspeccion(
                            inspeccion.getInspeccion_id(),
                            defectoId,
                            null,
                            ESTADO_ACTIVO,
                            umbralId,
                            request.getMetodoInspeccionId()
                    );
                }
            }
        }

        return toDTO(inspeccion);
    }

    @Override
    public List<InspeccionDTO> listar() {
        return inspeccionRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public InspeccionDTO obtenerPorId(Long id) {
        Inspeccion inspeccion = inspeccionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Inspección no encontrada con ID: " + id));
        return toDTO(inspeccion);
    }

    private InspeccionDTO toDTO(Inspeccion entity) {
        InspeccionDTO dto = new InspeccionDTO();
        dto.setId(entity.getInspeccion_id());
        dto.setFechaInspeccion(entity.getFechaInspeccion());
        dto.setResultado(entity.getResultado());
        dto.setObservaciones(entity.getObservaciones());
        dto.setEstado(entity.getEstado());
        if (entity.getVehiculo() != null) {
            dto.setVehiculoId(entity.getVehiculo().getVehiculoid());
        }
        if (entity.getLinea() != null) {
            dto.setLineaId(entity.getLinea().getLineaid());
        }
        if (entity.getDetalles() != null && !entity.getDetalles().isEmpty()
                && entity.getDetalles().get(0).getMetodoInspeccion() != null) {
            dto.setMetodoInspeccionId(entity.getDetalles().get(0).getMetodoInspeccion().getMetodoinspeccionid());
        }
        if (entity.getUsuario() != null) {
            dto.setUsuarioId(entity.getUsuario().getUsuarioId());
        }
        if (entity.getDetalles() != null) {
            dto.setDetalles(entity.getDetalles().stream()
                    .map(this::toDetalleDTO)
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    private DetalleInspeccionDTO toDetalleDTO(com.revisionvehicular.backend.entities.rtv.DetalleInspeccion entity) {
        DetalleInspeccionDTO dto = new DetalleInspeccionDTO();
        dto.setId(entity.getDetalle_inspeccion_id());
        dto.setInspeccionId(entity.getInspeccion().getInspeccion_id());
        dto.setDefectoId(entity.getDefecto().getDefectoid());
        dto.setObservacion(entity.getObservacion());
        dto.setEstado(entity.getEstado());
        if (entity.getUmbral() != null) {
            dto.setUmbralId(entity.getUmbral().getUmbralid());
        }
        if (entity.getMetodoInspeccion() != null) {
            dto.setMetodoInspeccionId(entity.getMetodoInspeccion().getMetodoinspeccionid());
        }
        return dto;
    }
}
