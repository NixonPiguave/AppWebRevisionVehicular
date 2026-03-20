package com.revisionvehicular.backend.service.srtv;

import com.revisionvehicular.backend.dtos.srtv.CertificadoRtvDTO;
import com.revisionvehicular.backend.dtos.srtv.EmpresaDTO;
import com.revisionvehicular.backend.entities.rtv.DetalleInspeccion;
import com.revisionvehicular.backend.entities.rtv.Inspeccion;
import com.revisionvehicular.backend.entities.srtv.Turnos;
import com.revisionvehicular.backend.repositories.rtv.IInspeccionRepository;
import com.revisionvehicular.backend.repositories.srtv.ITurnosRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class CertificadoRtvServiceImpl implements ICertificadoRtvService {

    private final ITurnosRepository turnosRepository;
    private final IInspeccionRepository inspeccionRepository;
    private final IEmpresaService empresaService;

    public CertificadoRtvServiceImpl(ITurnosRepository turnosRepository,
                                    IInspeccionRepository inspeccionRepository,
                                    IEmpresaService empresaService) {
        this.turnosRepository = turnosRepository;
        this.inspeccionRepository = inspeccionRepository;
        this.empresaService = empresaService;
    }

    @Override
    @Transactional(readOnly = true)
    public CertificadoRtvDTO obtenerDatosCertificado(Long turnoId) {
        CertificadoRtvDTO dto = new CertificadoRtvDTO();

        Turnos turno = turnosRepository.findById(turnoId)
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
        dto.setTotalTipo1(conteoTipos.getOrDefault(1, 0));
        dto.setTotalTipo2(conteoTipos.getOrDefault(2, 0));
        dto.setTotalTipo3(conteoTipos.getOrDefault(3, 0));
        dto.setResultadoFinal((dto.getTotalTipo2() > 0 || dto.getTotalTipo3() > 0) ? "RECHAZADO" : "APROBADO");

        return dto;
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
}
