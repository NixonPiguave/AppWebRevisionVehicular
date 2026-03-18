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
import java.util.LinkedHashSet;
import java.util.List;
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
        }
        dto.setPruebas(pruebas);

        return dto;
    }
}
