package com.revisionvehicular.backend.service.rtv;

import com.revisionvehicular.backend.dtos.rtv.CrearInspeccionRequest;
import com.revisionvehicular.backend.dtos.rtv.DetalleInspeccionDTO;
import com.revisionvehicular.backend.dtos.rtv.InspeccionDTO;
import com.revisionvehicular.backend.entities.rc.Umbral;
import com.revisionvehicular.backend.entities.rtv.Defecto;
import com.revisionvehicular.backend.entities.rtv.Equipos;
import com.revisionvehicular.backend.entities.rtv.Inspeccion;
import com.revisionvehicular.backend.entities.rtv.InspeccionEquipo;
import com.revisionvehicular.backend.repositories.rc.IUmbralRepository;
import com.revisionvehicular.backend.repositories.rtv.IDefectoRepository;
import com.revisionvehicular.backend.repositories.rtv.IDetalleInspeccionRepository;
import com.revisionvehicular.backend.repositories.rtv.IEquipoRepository;
import com.revisionvehicular.backend.repositories.rtv.IInspeccionEquipoRepository;
import com.revisionvehicular.backend.repositories.rtv.IInspeccionRepository;
import com.revisionvehicular.backend.config.BusinessException;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class InspeccionServiceImpl implements IInspeccionService {

    private static final Long UMBRAL_DEFAULT = 1L;
    private static final String ESTADO_ACTIVO = "A";
    private static final String RESULTADO_PENDIENTE = "PENDIENTE";
    private static final String RESULTADO_APROBADO = "APROBADO";
    private static final String RESULTADO_RECHAZADO = "RECHAZADO";

    private static final String CODIGO_DEFECTO_APROBADO = "SIN_DEFECTO";

    private static final String[] PARAMETROS_UMBRAL_ORDEN = {"CO", "HC", "LAMBDA", "OPACIDAD", "O2",
            "FRENOS_EFICACIA", "FRENOS_DESEQUILIBRIO", "SUSPENSION_EFICACIA", "SUSPENSION_DESEQUILIBRIO",
            "ALINEACION_CONVERGENCIA", "ALINEACION_DIVERGENCIA"};

    private final IInspeccionRepository inspeccionRepository;
    private final IDetalleInspeccionRepository detalleRepository;
    private final IDefectoRepository defectoRepository;
    private final IUmbralRepository umbralRepository;
    private final IInspeccionEquipoRepository inspeccionEquipoRepository;
    private final IEquipoRepository equipoRepository;
    private final ICriterioResultadoService criterioResultadoService;

    public InspeccionServiceImpl(IInspeccionRepository inspeccionRepository,
                                 IDetalleInspeccionRepository detalleRepository,
                                 IDefectoRepository defectoRepository,
                                 IUmbralRepository umbralRepository,
                                 IInspeccionEquipoRepository inspeccionEquipoRepository,
                                 IEquipoRepository equipoRepository,
                                 ICriterioResultadoService criterioResultadoService) {
        this.inspeccionRepository = inspeccionRepository;
        this.detalleRepository = detalleRepository;
        this.defectoRepository = defectoRepository;
        this.umbralRepository = umbralRepository;
        this.inspeccionEquipoRepository = inspeccionEquipoRepository;
        this.equipoRepository = equipoRepository;
        this.criterioResultadoService = criterioResultadoService;
    }

    /**
     * Obtiene la peor calificación de umbral para los valores medidos.
     * 1=OK, 2=TIPO1, 3=TIPO2, 4=TIPO3. Retorna null si no hay valores.
     */
    private Integer resolverPeorCalificacionUmbral(Map<String, Object> valoresMedidos) {
        if (valoresMedidos == null || valoresMedidos.isEmpty()) return null;
        int peor = 0;
        for (String param : PARAMETROS_UMBRAL_ORDEN) {
            Object v = valoresMedidos.get(param);
            if (v == null) continue;
            BigDecimal valor = v instanceof Number ? BigDecimal.valueOf(((Number) v).doubleValue()) : null;
            if (valor == null) continue;
            List<Umbral> umbrales = umbralRepository.findUmbralesPorParametroYValor(param, valor);
            for (Umbral u : umbrales) {
                int cal = u.getCalificacion() != null ? u.getCalificacion() : 0;
                if (cal > peor) peor = cal;
            }
        }
        return peor > 0 ? peor : null;
    }

    /**
     * Valida rangos de valores medidos (CO, HC, O2, Opacidad, eficacia/desequilibrio 0-100).
     */
    private void validarRangosValoresMedidos(Map<String, Object> valoresMedidos) {
        if (valoresMedidos == null || valoresMedidos.isEmpty()) return;
        for (Map.Entry<String, Object> e : valoresMedidos.entrySet()) {
            Object v = e.getValue();
            if (v == null || !(v instanceof Number)) continue;
            double val = ((Number) v).doubleValue();
            String key = e.getKey();
            if (val < 0) {
                throw new BusinessException("El valor de " + key + " no puede ser negativo");
            }
            if ("O2".equals(key) && val > 25) {
                throw new BusinessException("El valor de O2 no puede ser mayor a 25");
            }
            if (("CO".equals(key) || "OPACIDAD".equals(key) ||
                    "FRENOS_EFICACIA".equals(key) || "FRENOS_DESEQUILIBRIO".equals(key) ||
                    "SUSPENSION_EFICACIA".equals(key) || "SUSPENSION_DESEQUILIBRIO".equals(key)) && val > 100) {
                throw new BusinessException("El valor de " + key + " no puede ser mayor a 100");
            }
        }
    }

    /**
     * Resuelve el umbral según valores medidos. Usa el "peor" umbral (mayor calificación).
     */
    private Long resolverUmbralId(Map<String, Object> valoresMedidos) {
        if (valoresMedidos == null || valoresMedidos.isEmpty()) {
            return UMBRAL_DEFAULT;
        }
        Umbral peor = null;
        for (String param : PARAMETROS_UMBRAL_ORDEN) {
            Object v = valoresMedidos.get(param);
            if (v == null) continue;
            BigDecimal valor = v instanceof Number ? BigDecimal.valueOf(((Number) v).doubleValue()) : null;
            if (valor == null) continue;
            List<Umbral> umbrales = umbralRepository.findUmbralesPorParametroYValor(param, valor);
            for (Umbral u : umbrales) {
                int cal = u.getCalificacion() != null ? u.getCalificacion() : 0;
                int calPeor = peor != null && peor.getCalificacion() != null ? peor.getCalificacion() : 0;
                if (peor == null || cal > calPeor) {
                    peor = u;
                }
            }
        }
        return peor != null ? peor.getUmbralid() : UMBRAL_DEFAULT;
    }

    @Override
    @Transactional
    public InspeccionDTO crear(CrearInspeccionRequest request) {
        if (request.getVehiculoId() == null) {
            throw new BusinessException("vehiculoId es obligatorio");
        }
        if (request.getMetodoInspeccionId() == null) {
            throw new BusinessException("metodoInspeccionId es obligatorio");
        }
        if (request.getUsuarioId() == null) {
            throw new BusinessException("usuarioId es obligatorio");
        }
        if (request.getKilometraje() != null && request.getKilometraje() < 0) {
            throw new BusinessException("El kilometraje no puede ser negativo");
        }
        validarRangosValoresMedidos(request.getValoresMedidos());

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
            throw new BusinessException("No se pudo recuperar la inspección recién creada");
        }

        List<Long> defectosIds = request.getDefectosIds();
        Long metodoId = request.getMetodoInspeccionId();
        Long umbralId = resolverUmbralId(request.getValoresMedidos());
        Map<Integer, Integer> conteoTipos = contarTiposDefecto(defectosIds);

        // Para gases/mecatrónica: el resultado se deriva de los umbrales (valores medidos vs normativa)
        // calificacion 1=OK, 2=TIPO1, 3=TIPO2, 4=TIPO3
        Integer peorCalificacionUmbral = resolverPeorCalificacionUmbral(request.getValoresMedidos());
        if (peorCalificacionUmbral != null && peorCalificacionUmbral >= 2) {
            int tipo = Math.min(peorCalificacionUmbral - 1, 3);
            conteoTipos.put(tipo, conteoTipos.getOrDefault(tipo, 0) + 1);
        }

        if (defectosIds != null && !defectosIds.isEmpty()) {
            for (Long defectoId : defectosIds) {
                if (defectoId != null && defectoId > 0) {
                    detalleRepository.insertarDetalleInspeccion(
                            inspeccion.getInspeccion_id(),
                            defectoId,
                            null,
                            ESTADO_ACTIVO,
                            umbralId,
                            metodoId
                    );
                }
            }
        } else if (metodoId != null) {
            // Mecatrónica/Gases: registrar método con defecto SIN_DEFECTO (el resultado viene de umbrales)
            defectoRepository.findByCodigo(CODIGO_DEFECTO_APROBADO).ifPresent(defecto ->
                detalleRepository.insertarDetalleInspeccion(
                        inspeccion.getInspeccion_id(),
                        defecto.getDefectoid(),
                        request.getObservaciones(),
                        ESTADO_ACTIVO,
                        umbralId,
                        metodoId
                )
            );
        }

        String resultadoFinal = resolverResultado(conteoTipos);
        inspeccionRepository.actualizarResultado(inspeccion.getInspeccion_id(), resultadoFinal);
        inspeccion.setResultado(resultadoFinal);

        Map<String, Object> valoresParaGuardar = request.getValoresMedidos() != null
                ? new HashMap<>(request.getValoresMedidos())
                : new HashMap<>();
        if (request.getKilometraje() != null && request.getKilometraje() >= 0) {
            valoresParaGuardar.put("KILOMETRAJE", request.getKilometraje());
        }
        if (!valoresParaGuardar.isEmpty()) {
            try {
                String json = new ObjectMapper().writeValueAsString(valoresParaGuardar);
                inspeccionRepository.actualizarValoresMedidos(inspeccion.getInspeccion_id(), json);
            } catch (JsonProcessingException ignored) {}
        }

        if (request.getEquiposIds() != null && !request.getEquiposIds().isEmpty()) {
            for (Long equipoId : request.getEquiposIds()) {
                if (equipoId == null || equipoId <= 0) continue;
                equipoRepository.findById(equipoId).ifPresent(equipo -> {
                    InspeccionEquipo ie = new InspeccionEquipo();
                    ie.setInspeccion(inspeccion);
                    ie.setEquipo(equipo);
                    inspeccionEquipoRepository.save(ie);
                });
            }
        }

        return toDTO(inspeccion);
    }

    private Map<Integer, Integer> contarTiposDefecto(List<Long> defectosIds) {
        Map<Integer, Integer> conteo = new HashMap<>();
        conteo.put(1, 0);
        conteo.put(2, 0);
        conteo.put(3, 0);
        if (defectosIds == null || defectosIds.isEmpty()) {
            return conteo;
        }

        List<Defecto> defectos = defectoRepository.findAllById(
                defectosIds.stream().filter(id -> id != null && id > 0).distinct().collect(Collectors.toList())
        );
        for (Defecto d : defectos) {
            Integer tipo = extraerTipoDefecto(d);
            if (tipo != null && tipo >= 1 && tipo <= 3) {
                conteo.put(tipo, conteo.get(tipo) + 1);
            }
        }
        return conteo;
    }

    private Integer extraerTipoDefecto(Defecto defecto) {
        if (defecto == null) {
            return null;
        }
        String tipoCodigo = "";
        String tipoNombre = "";
        if (defecto.getTipoDefecto() != null) {
            tipoCodigo = defecto.getTipoDefecto().getCodigo() != null ? defecto.getTipoDefecto().getCodigo() : "";
            tipoNombre = defecto.getTipoDefecto().getNombre() != null ? defecto.getTipoDefecto().getNombre() : "";
        }
        // Fallback para datos legacy sin relación de tipo
        String combinado = (tipoCodigo + " " + tipoNombre + " "
                + safe(defecto.getCodigo()) + " "
                + safe(defecto.getDescripciontipo()) + " "
                + safe(defecto.getDescripcion())).toUpperCase().trim();

        if (combinado.matches(".*\\b3\\b.*") || combinado.contains("TIPO 3") || combinado.contains("TIPO III") || combinado.endsWith(" III")) return 3;
        if (combinado.matches(".*\\b2\\b.*") || combinado.contains("TIPO 2") || combinado.contains("TIPO II") || combinado.endsWith(" II")) return 2;
        if (combinado.matches(".*\\b1\\b.*") || combinado.contains("TIPO 1") || combinado.contains("TIPO I") || combinado.endsWith(" I")) return 1;
        return null;
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    /**
     * Resultado final según criterios configurados (rtv_criterio_resultado).
     */
    private String resolverResultado(Map<Integer, Integer> conteoTipos) {
        int t1 = conteoTipos.getOrDefault(1, 0);
        int t2 = conteoTipos.getOrDefault(2, 0);
        int t3 = conteoTipos.getOrDefault(3, 0);
        if (criterioResultadoService.debeRechazar(t1, t2, t3)) return RESULTADO_RECHAZADO;
        return RESULTADO_APROBADO;
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
