package com.revisionvehicular.backend.service.srtv;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.revisionvehicular.backend.dtos.srtv.CertificadoRtvDTO;
import com.revisionvehicular.backend.dtos.srtv.EmpresaDTO;
import com.revisionvehicular.backend.entities.rc.Umbral;
import com.revisionvehicular.backend.entities.rtv.DetalleInspeccion;
import com.revisionvehicular.backend.entities.rtv.Inspeccion;
import com.revisionvehicular.backend.entities.rtv.InspeccionEquipo;
import com.revisionvehicular.backend.entities.srtv.Turnos;
import com.revisionvehicular.backend.repositories.rc.IUmbralRepository;
import com.revisionvehicular.backend.repositories.rtv.IInspeccionEquipoRepository;
import com.revisionvehicular.backend.repositories.rtv.IInspeccionRepository;
import com.revisionvehicular.backend.service.rtv.ICriterioResultadoService;
import com.revisionvehicular.backend.repositories.srtv.ITurnosRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class CertificadoRtvServiceImpl implements ICertificadoRtvService {

    private static final String[] ORDEN_PARAMETROS_CERT = {"CO", "HC", "LAMBDA", "OPACIDAD", "O2",
            "FRENOS_EFICACIA", "FRENOS_DESEQUILIBRIO", "SUSPENSION_EFICACIA", "SUSPENSION_DESEQUILIBRIO",
            "ALINEACION_CONVERGENCIA", "ALINEACION_DIVERGENCIA"};

    private static final Map<String, String> DESCRIPCIONES_PRUEBA = new LinkedHashMap<>();
    private static final Map<String, String> UBICACIONES_PRUEBA = new LinkedHashMap<>();
    /** Unidad y límites por defecto cuando no se obtienen de umbrales (ej. valor fuera de rango) */
    private static final Map<String, String> UNIDAD_DEFECTO = new LinkedHashMap<>();
    private static final Map<String, String> LIMITES_DEFECTO = new LinkedHashMap<>();
    static {
        DESCRIPCIONES_PRUEBA.put("CO", "Emisión de CO en Altas");
        DESCRIPCIONES_PRUEBA.put("HC", "Emisión de HC en Altas");
        DESCRIPCIONES_PRUEBA.put("LAMBDA", "Factor Lambda");
        DESCRIPCIONES_PRUEBA.put("OPACIDAD", "Opacidad de humos");
        DESCRIPCIONES_PRUEBA.put("O2", "Emisión de O2");
        DESCRIPCIONES_PRUEBA.put("FRENOS_EFICACIA", "Eficacia de Freno de Estacionamiento");
        DESCRIPCIONES_PRUEBA.put("FRENOS_DESEQUILIBRIO", "Desequilibrio de Frenos");
        DESCRIPCIONES_PRUEBA.put("SUSPENSION_EFICACIA", "Eficacia Suspensión Rueda Derecha 1er Eje");
        DESCRIPCIONES_PRUEBA.put("SUSPENSION_DESEQUILIBRIO", "Desequilibrio Suspensión");
        DESCRIPCIONES_PRUEBA.put("ALINEACION_CONVERGENCIA", "Alineación - Convergencia");
        DESCRIPCIONES_PRUEBA.put("ALINEACION_DIVERGENCIA", "Alineación - Divergencia");
        UBICACIONES_PRUEBA.put("CO", "Gases de escape");
        UBICACIONES_PRUEBA.put("HC", "Gases de escape");
        UBICACIONES_PRUEBA.put("LAMBDA", "Gases de escape");
        UBICACIONES_PRUEBA.put("OPACIDAD", "Gases de escape");
        UBICACIONES_PRUEBA.put("O2", "Gases de escape");
        UBICACIONES_PRUEBA.put("FRENOS_EFICACIA", "Freno estacionamiento");
        UBICACIONES_PRUEBA.put("FRENOS_DESEQUILIBRIO", "Ejes delantero/trasero");
        UBICACIONES_PRUEBA.put("SUSPENSION_EFICACIA", "Rueda derecha 1er eje");
        UBICACIONES_PRUEBA.put("SUSPENSION_DESEQUILIBRIO", "Ejes delantero/trasero");
        UBICACIONES_PRUEBA.put("ALINEACION_CONVERGENCIA", "Eje delantero");
        UBICACIONES_PRUEBA.put("ALINEACION_DIVERGENCIA", "Eje delantero");
        UNIDAD_DEFECTO.put("LAMBDA", "λ");
        LIMITES_DEFECTO.put("LAMBDA", "0,97≤X≤1,03");
    }

    private final ITurnosRepository turnosRepository;
    private final IInspeccionRepository inspeccionRepository;
    private final IInspeccionEquipoRepository inspeccionEquipoRepository;
    private final IUmbralRepository umbralRepository;
    private final IEmpresaService empresaService;
    private final ICriterioResultadoService criterioResultadoService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public CertificadoRtvServiceImpl(ITurnosRepository turnosRepository,
                                    IInspeccionRepository inspeccionRepository,
                                    IInspeccionEquipoRepository inspeccionEquipoRepository,
                                    IUmbralRepository umbralRepository,
                                    IEmpresaService empresaService,
                                    ICriterioResultadoService criterioResultadoService) {
        this.turnosRepository = turnosRepository;
        this.inspeccionRepository = inspeccionRepository;
        this.inspeccionEquipoRepository = inspeccionEquipoRepository;
        this.umbralRepository = umbralRepository;
        this.empresaService = empresaService;
        this.criterioResultadoService = criterioResultadoService;
    }

    @Override
    @Transactional(readOnly = true)
    public CertificadoRtvDTO obtenerDatosCertificado(Long turnoId) {
        CertificadoRtvDTO dto = new CertificadoRtvDTO();

        Turnos turno = turnosRepository.findByIdWithVehiculoCompleto(turnoId)
                .or(() -> turnosRepository.findById(turnoId))
                .orElseThrow(() -> new RuntimeException("Turno no encontrado con ID: " + turnoId));

        Long vehiculoId = turno.getVehiculo() != null ? turno.getVehiculo().getVehiculoid() : null;
        if (vehiculoId == null) {
            throw new RuntimeException("El turno no tiene vehículo asociado");
        }

        LocalDate fechaInicio = turno.getFechaInicio();
        LocalDate fechaFin = turno.getFechaFin();
        LocalDateTime desde = (fechaInicio != null ? fechaInicio : LocalDate.now()).atStartOfDay();
        LocalDateTime hasta = (fechaFin != null ? fechaFin.plusDays(1) : LocalDate.now().plusDays(1)).atStartOfDay().minusNanos(1);

        List<Inspeccion> inspecciones = inspeccionRepository.findByVehiculoIdAndRangoFechas(vehiculoId, desde, hasta);

        // Empresa
        List<EmpresaDTO> empresas = empresaService.findAll();
        if (!empresas.isEmpty()) {
            EmpresaDTO e = empresas.get(0);
            CertificadoRtvDTO.EmpresaInfo emp = new CertificadoRtvDTO.EmpresaInfo();
            emp.setNombre(e.getNombre());
            emp.setDireccion(e.getDireccion());
            emp.setTelefono(e.getTelefono());
            emp.setCorreo(e.getCorreo());
            emp.setLogoempresa(e.getLogoempresa());
            emp.setRuc(e.getRuc());
            dto.setEmpresa(emp);
        }

        // Inspectores únicos (nombre + apellido)
        Set<String> inspectorSet = new LinkedHashSet<>();
        for (Inspeccion i : inspecciones) {
            if (i.getUsuario() != null) {
                String nom = (i.getUsuario().getNombre() != null ? i.getUsuario().getNombre() : "")
                        + " " + (i.getUsuario().getApellido() != null ? i.getUsuario().getApellido() : "");
                inspectorSet.add(nom.trim());
            }
        }
        dto.setInspectores(new ArrayList<>(inspectorSet));

        // Equipos utilizados (trazabilidad, sin duplicados por equipo_id)
        List<Long> inspeccionIds = inspecciones.stream()
                .map(Inspeccion::getInspeccion_id)
                .filter(id -> id != null)
                .distinct()
                .toList();
        Set<Long> equipoIdsVistos = new LinkedHashSet<>();
        List<CertificadoRtvDTO.EquipoUtilizadoInfo> equiposList = new ArrayList<>();
        if (!inspeccionIds.isEmpty()) {
            List<InspeccionEquipo> ies = inspeccionEquipoRepository.findByInspeccionIdInWithEquipo(inspeccionIds);
            for (InspeccionEquipo ie : ies) {
                if (ie.getEquipo() == null || ie.getEquipo().getEquipoid() == null) continue;
                if (equipoIdsVistos.add(ie.getEquipo().getEquipoid())) {
                    CertificadoRtvDTO.EquipoUtilizadoInfo eq = new CertificadoRtvDTO.EquipoUtilizadoInfo();
                    eq.setNombre(ie.getEquipo().getEquipo());
                    eq.setModelo(ie.getEquipo().getModelo());
                    eq.setSerial(ie.getEquipo().getSerialEquipo());
                    eq.setCodigoInterno(ie.getEquipo().getCodigoInterno());
                    equiposList.add(eq);
                }
            }
        }
        dto.setEquiposUtilizados(equiposList);

        // Turno info
        CertificadoRtvDTO.TurnoInfo ti = new CertificadoRtvDTO.TurnoInfo();
        ti.setNumeroTurno("TRN-" + turnoId);
        ti.setPlaca(turno.getVehiculo() != null ? turno.getVehiculo().getMatricula() : "-");
        ti.setPropietarioNombre(turno.getPropietario() != null ? turno.getPropietario().getNombre() : "-");
        ti.setServicioNombre(turno.getServicio() != null ? turno.getServicio().getNombre() : "-");
        ti.setFechaInicio(fechaInicio != null ? fechaInicio.format(DateTimeFormatter.ISO_LOCAL_DATE) : "-");
        dto.setTurno(ti);

        // Pruebas (una por inspección: método, resultado, observaciones, inspector)
        List<CertificadoRtvDTO.PruebaInfo> pruebas = new ArrayList<>();
        List<CertificadoRtvDTO.DefectoCertificadoInfo> defectosCertificado = new ArrayList<>();
        Map<Integer, Integer> conteoTipos = new HashMap<>();
        conteoTipos.put(1, 0);
        conteoTipos.put(2, 0);
        conteoTipos.put(3, 0);
        for (Inspeccion ins : inspecciones) {
            CertificadoRtvDTO.PruebaInfo p = new CertificadoRtvDTO.PruebaInfo();
            String metodoNombre = "Inspección";
            if (ins.getDetalles() != null && !ins.getDetalles().isEmpty()) {
                DetalleInspeccion det = ins.getDetalles().get(0);
                if (det.getMetodoInspeccion() != null && det.getMetodoInspeccion().getNombre() != null) {
                    metodoNombre = det.getMetodoInspeccion().getNombre();
                }
            }
            p.setMetodoNombre(metodoNombre);
            p.setResultado(ins.getResultado() != null ? ins.getResultado() : "-");
            p.setObservaciones(ins.getObservaciones() != null ? ins.getObservaciones() : "");
            p.setFechaInspeccion(ins.getFechaInspeccion());
            if (ins.getUsuario() != null) {
                p.setInspectorNombre(ins.getUsuario().getNombre() + " " + (ins.getUsuario().getApellido() != null ? ins.getUsuario().getApellido() : ""));
            } else {
                p.setInspectorNombre("-");
            }
            pruebas.add(p);

            if (ins.getDetalles() != null) {
                for (DetalleInspeccion det : ins.getDetalles()) {
                    if (det.getDefecto() == null || det.getDefecto().getCodigo() == null) continue;
                    if ("SIN_DEFECTO".equalsIgnoreCase(det.getDefecto().getCodigo())) continue;

                    CertificadoRtvDTO.DefectoCertificadoInfo d = new CertificadoRtvDTO.DefectoCertificadoInfo();
                    d.setCodigo(det.getDefecto().getCodigo());
                    d.setDescripcion(det.getDefecto().getDescripcion());
                    Integer tipo = extraerTipoDefecto(det);
                    d.setTipo(tipo != null ? "TIPO " + tipo : "N/D");
                    defectosCertificado.add(d);
                    if (tipo != null && tipo >= 1 && tipo <= 3) {
                        conteoTipos.put(tipo, conteoTipos.get(tipo) + 1);
                    }
                }
            }
        }
        dto.setPruebas(pruebas);
        dto.setDefectos(defectosCertificado);

        // Vehículo
        if (turno.getVehiculo() != null) {
            var v = turno.getVehiculo();
            CertificadoRtvDTO.VehiculoInfo vi = new CertificadoRtvDTO.VehiculoInfo();
            vi.setPlaca(v.getMatricula());
            vi.setChasis(v.getChasis());
            vi.setMotor(v.getCodigoMotor());
            vi.setVin(v.getVin());
            vi.setAnio(v.getAnioFabricacion());
            if (v.getModeloVehiculo() != null) {
                vi.setModelo(v.getModeloVehiculo().getNombre());
                if (v.getModeloVehiculo().getMarca() != null) {
                    vi.setMarca(v.getModeloVehiculo().getMarca().getNombre());
                }
            }
            dto.setVehiculo(vi);
        }

        // Pruebas mecatrónicas (de inspecciones con valoresMedidos, sin duplicar por parámetro)
        Map<String, CertificadoRtvDTO.PruebaMecatronicaInfo> mapPruebas = new LinkedHashMap<>();
        for (Inspeccion ins : inspecciones) {
            if (ins.getValoresMedidos() == null || ins.getValoresMedidos().isBlank()) continue;
            try {
                Map<String, Object> vm = objectMapper.readValue(ins.getValoresMedidos(), new TypeReference<Map<String, Object>>() {});
                for (String param : ORDEN_PARAMETROS_CERT) {
                    if (mapPruebas.containsKey(param)) continue;
                    Object val = vm.get(param);
                    if (val == null) continue;
                    BigDecimal valor = val instanceof Number ? BigDecimal.valueOf(((Number) val).doubleValue()) : null;
                    if (valor == null) continue;

                    List<Umbral> umbrales = umbralRepository.findUmbralesPorParametroYValor(param, valor);
                    Umbral umbral = null;
                    for (Umbral u : umbrales) {
                        int c = u.getCalificacion() != null ? u.getCalificacion() : 0;
                        int cp = umbral != null && umbral.getCalificacion() != null ? umbral.getCalificacion() : 0;
                        if (umbral == null || c > cp) umbral = u;
                    }

                    CertificadoRtvDTO.PruebaMecatronicaInfo pm = new CertificadoRtvDTO.PruebaMecatronicaInfo();
                    pm.setCodigo(param);
                    pm.setDescripcionPrueba(DESCRIPCIONES_PRUEBA.getOrDefault(param, param));
                    pm.setValor(formatearValor(valor));

                    if (umbral != null) {
                        String unidad = umbral.getUnidadMedida() != null && umbral.getUnidadMedida().getSimbolo() != null
                                ? umbral.getUnidadMedida().getSimbolo() : "";
                        String unidadFinal = (unidad == null || unidad.isEmpty() || "-".equals(unidad))
                                ? UNIDAD_DEFECTO.getOrDefault(param, "") : unidad;
                        pm.setUnidad(unidadFinal);
                        if (umbral.getValorMin() != null && umbral.getValorMax() != null) {
                            pm.setLimites(String.format("%s<=X<=%s", formatearValor(umbral.getValorMin()), formatearValor(umbral.getValorMax())));
                        } else {
                            pm.setLimites(obtenerLimitesPorParametro(param));
                        }
                        int cal = umbral.getCalificacion() != null ? umbral.getCalificacion() : 0;
                        pm.setCalificacion(cal <= 1 ? "OK" : "TIPO " + (cal - 1));
                        if (cal >= 2 && cal <= 4) {
                            int tipo = Math.min(cal - 1, 3);
                            conteoTipos.put(tipo, conteoTipos.getOrDefault(tipo, 0) + 1);
                        }
                    } else {
                        pm.setUnidad(UNIDAD_DEFECTO.getOrDefault(param, ""));
                        String lim = obtenerLimitesPorParametro(param);
                        pm.setLimites("-".equals(lim) ? LIMITES_DEFECTO.getOrDefault(param, "-") : lim);
                        pm.setCalificacion("OK");
                    }
                    mapPruebas.put(param, pm);
                }
            } catch (Exception ignored) {}
        }
        dto.setPruebasMecatronicas(new ArrayList<>(mapPruebas.values()));

        // Totales (visual + mecatrónico) y resultado final
        dto.setTotalTipo1(conteoTipos.getOrDefault(1, 0));
        dto.setTotalTipo2(conteoTipos.getOrDefault(2, 0));
        dto.setTotalTipo3(conteoTipos.getOrDefault(3, 0));
        dto.setResultadoFinal(criterioResultadoService.debeRechazar(
                dto.getTotalTipo1(), dto.getTotalTipo2(), dto.getTotalTipo3()) ? "RECHAZADO" : "APROBADO");

        // Fechas y datos adicionales
        LocalDate fechaRev = fechaInicio != null ? fechaInicio : LocalDate.now();
        dto.setFechaEmision(fechaRev.format(DateTimeFormatter.ofPattern("dd/MMM/yyyy", java.util.Locale.forLanguageTag("es"))).toUpperCase());
        dto.setValidoHasta(fechaRev.plusMonths(6).format(DateTimeFormatter.ofPattern("dd/MM/yy")));
        dto.setKilometraje(extraerKilometrajeDeInspecciones(inspecciones));
        dto.setNumeroRevision(inspecciones.isEmpty() ? "1" : String.valueOf(inspecciones.size()));

        if (!inspecciones.isEmpty() && inspecciones.get(0).getLinea() != null) {
            var lin = inspecciones.get(0).getLinea();
            CertificadoRtvDTO.LineaInfo li = new CertificadoRtvDTO.LineaInfo();
            li.setCodigo(String.valueOf(lin.getLineaid()));
            li.setDescripcion(lin.getNombre() != null ? lin.getNombre() : (lin.getDescripcion() != null ? lin.getDescripcion() : ""));
            dto.setLinea(li);
        }

        return dto;
    }

    private String formatearValor(BigDecimal v) {
        if (v == null) return "-";
        return String.format("%.2f", v).replace(".", ",");
    }

    /** Obtiene límites del rango OK (calificación 1) para el parámetro, o el primer umbral disponible */
    private String obtenerLimitesPorParametro(String parametro) {
        List<Umbral> umbrales = umbralRepository.findUmbralesPorParametro(parametro);
        for (Umbral u : umbrales) {
            if (u.getValorMin() != null && u.getValorMax() != null) {
                return String.format("%s<=X<=%s", formatearValor(u.getValorMin()), formatearValor(u.getValorMax()));
            }
        }
        return "-";
    }

    private Integer extraerTipoDefecto(DetalleInspeccion det) {
        if (det == null || det.getDefecto() == null) return null;
        String tipoCodigo = "";
        String tipoNombre = "";
        if (det.getDefecto().getTipoDefecto() != null) {
            tipoCodigo = det.getDefecto().getTipoDefecto().getCodigo() != null ? det.getDefecto().getTipoDefecto().getCodigo() : "";
            tipoNombre = det.getDefecto().getTipoDefecto().getNombre() != null ? det.getDefecto().getTipoDefecto().getNombre() : "";
        }

        String valor = (tipoCodigo + " " + tipoNombre + " "
                + safe(det.getDefecto().getCodigo()) + " "
                + safe(det.getDefecto().getDescripciontipo()) + " "
                + safe(det.getDefecto().getDescripcion())).toUpperCase().trim();
        if (valor.matches(".*\\b3\\b.*") || valor.contains("TIPO 3") || valor.contains("TIPO III") || valor.endsWith(" III")) return 3;
        if (valor.matches(".*\\b2\\b.*") || valor.contains("TIPO 2") || valor.contains("TIPO II") || valor.endsWith(" II")) return 2;
        if (valor.matches(".*\\b1\\b.*") || valor.contains("TIPO 1") || valor.contains("TIPO I") || valor.endsWith(" I")) return 1;
        return null;
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    /** Extrae el kilometraje de la primera inspección que lo tenga en valoresMedidos (KILOMETRAJE). */
    private Integer extraerKilometrajeDeInspecciones(List<Inspeccion> inspecciones) {
        if (inspecciones == null) return null;
        for (Inspeccion ins : inspecciones) {
            if (ins.getValoresMedidos() == null || ins.getValoresMedidos().isBlank()) continue;
            try {
                Map<String, Object> vm = objectMapper.readValue(ins.getValoresMedidos(), new TypeReference<Map<String, Object>>() {});
                Object km = vm.get("KILOMETRAJE");
                if (km == null) continue;
                if (km instanceof Number) {
                    int val = ((Number) km).intValue();
                    if (val >= 0) return val;
                }
            } catch (Exception ignored) {}
        }
        return null;
    }
}
