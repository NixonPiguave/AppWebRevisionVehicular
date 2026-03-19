package com.revisionvehicular.backend.controllers.rtv;

import com.revisionvehicular.backend.dtos.rtv.CertificadoImprontaDTO;
import com.revisionvehicular.backend.dtos.rtv.CertificadoMatriculaVehicularDTO;
import com.revisionvehicular.backend.dtos.srtv.EmpresaDTO;
import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.rtv.Impronta;
import com.revisionvehicular.backend.entities.srtv.Turnos;
import com.revisionvehicular.backend.repositories.cv.IVehiculoRepository;
import com.revisionvehicular.backend.repositories.rtv.IImprontaRepository;
import com.revisionvehicular.backend.repositories.srtv.ITurnosRepository;
import com.revisionvehicular.backend.service.srtv.IEmpresaService;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/turnos")
public class CertificadosRegistroVehicularController {

    private final ITurnosRepository turnosRepository;
    private final IImprontaRepository improntaRepository;
    private final IEmpresaService empresaService;
    private final IVehiculoRepository vehiculoRepository;

    public CertificadosRegistroVehicularController(
            ITurnosRepository turnosRepository,
            IImprontaRepository improntaRepository,
            IEmpresaService empresaService,
            IVehiculoRepository vehiculoRepository
    ) {
        this.turnosRepository = turnosRepository;
        this.improntaRepository = improntaRepository;
        this.empresaService = empresaService;
        this.vehiculoRepository = vehiculoRepository;
    }

    @GetMapping("/vehiculos/{vehiculoId}/certificado-impronta")
    @Transactional(readOnly = true)
    public ResponseEntity<CertificadoImprontaDTO> certificadoImprontaPorVehiculo(@PathVariable Long vehiculoId) {
        Vehiculo v = vehiculoRepository.findById(vehiculoId)
                .orElseThrow(() -> new RuntimeException("Vehículo no encontrado con ID: " + vehiculoId));
        // No tenemos turno aquí; armamos certificado con lo que exista.
        Impronta impronta = improntaRepository.findTopByVehiculo_VehiculoidOrderByFechaRegistroDesc(v.getVehiculoid())
                .orElse(null);
        CertificadoImprontaDTO dto = construirCertificadoImpronta(null, v, impronta);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{id}/certificado-impronta")
    @Transactional(readOnly = true)
    public ResponseEntity<CertificadoImprontaDTO> certificadoImpronta(@PathVariable Long id) {
        Turnos turno = turnosRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado con ID: " + id));
        if (turno.getVehiculo() == null) {
            throw new RuntimeException("El turno no tiene vehículo asociado");
        }
        Vehiculo v = turno.getVehiculo();

        Impronta impronta = improntaRepository.findTopByVehiculo_VehiculoidOrderByFechaRegistroDesc(v.getVehiculoid())
                .orElse(null);

        CertificadoImprontaDTO dto = construirCertificadoImpronta(turno, v, impronta);

        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{id}/certificado-matricula")
    @Transactional(readOnly = true)
    public ResponseEntity<CertificadoMatriculaVehicularDTO> certificadoMatricula(@PathVariable Long id) {
        Turnos turno = turnosRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado con ID: " + id));
        if (turno.getVehiculo() == null) {
            throw new RuntimeException("El turno no tiene vehículo asociado");
        }
        Vehiculo v = turno.getVehiculo();

        CertificadoMatriculaVehicularDTO dto = new CertificadoMatriculaVehicularDTO();
        dto.setFechaEmision(LocalDate.now());

        List<EmpresaDTO> empresas = empresaService.findAll();
        if (!empresas.isEmpty()) {
            EmpresaDTO e = empresas.get(0);
            CertificadoMatriculaVehicularDTO.EmpresaInfo emp = new CertificadoMatriculaVehicularDTO.EmpresaInfo();
            emp.setNombre(e.getNombre());
            emp.setLogoempresa(e.getLogoempresa());
            dto.setEmpresa(emp);
        }

        CertificadoMatriculaVehicularDTO.PropietarioInfo p = new CertificadoMatriculaVehicularDTO.PropietarioInfo();
        if (turno.getPropietario() != null) {
            p.setNombre(turno.getPropietario().getNombre());
            p.setDocumento(turno.getPropietario().getDocumentoIdentidad());
        }
        dto.setPropietario(p);

        CertificadoMatriculaVehicularDTO.VehiculoInfo vi = new CertificadoMatriculaVehicularDTO.VehiculoInfo();
        vi.setPlacaActual(v.getMatricula());
        vi.setPlacaAnterior(v.getPlacaAnterior() != null ? v.getPlacaAnterior() : v.getMatricula());
        vi.setMatriculaVehicular(v.getNumeroMatriculaVehicular());
        vi.setChasis(v.getChasis());
        vi.setMotor(v.getCodigoMotor());
        vi.setColor(v.getColor());
        vi.setAnio(v.getAnioFabricacion());
        if (v.getModeloVehiculo() != null) {
            vi.setModelo(v.getModeloVehiculo().getNombre());
            if (v.getModeloVehiculo().getMarca() != null) vi.setMarca(v.getModeloVehiculo().getMarca().getNombre());
        }
        if (v.getTipoMatricula() != null) vi.setTipoServicio(v.getTipoMatricula().getNombre());
        if (v.getTipoVehiculo() != null) vi.setClase(v.getTipoVehiculo().getNombre());
        dto.setVehiculo(vi);

        return ResponseEntity.ok(dto);
    }

    private String extraerValor(String desc, String key) {
        if (desc == null) return null;
        String[] parts = desc.split("\\|");
        for (String p : parts) {
            String t = p.trim();
            if (t.toUpperCase().startsWith(key + ":")) {
                return t.substring((key + ":").length()).trim();
            }
        }
        return null;
    }

    private CertificadoImprontaDTO construirCertificadoImpronta(Turnos turno, Vehiculo v, Impronta impronta) {
        CertificadoImprontaDTO dto = new CertificadoImprontaDTO();
        dto.setFechaEmision(LocalDate.now());
        dto.setFechaRegistroImpronta(impronta != null ? impronta.getFechaRegistro() : null);

        // Empresa (primera)
        List<EmpresaDTO> empresas = empresaService.findAll();
        if (!empresas.isEmpty()) {
            EmpresaDTO e = empresas.get(0);
            CertificadoImprontaDTO.EmpresaInfo emp = new CertificadoImprontaDTO.EmpresaInfo();
            emp.setNombre(e.getNombre());
            emp.setLogoempresa(e.getLogoempresa());
            dto.setEmpresa(emp);
        }

        // Propietario (si hay turno)
        CertificadoImprontaDTO.PropietarioInfo p = new CertificadoImprontaDTO.PropietarioInfo();
        if (turno != null && turno.getPropietario() != null) {
            p.setNombre(turno.getPropietario().getNombre());
            p.setDocumento(turno.getPropietario().getDocumentoIdentidad());
        } else if (v.getPropietario() != null) {
            p.setNombre(v.getPropietario().getNombre());
            p.setDocumento(v.getPropietario().getDocumentoIdentidad());
        }
        dto.setPropietario(p);

        // Vehículo
        CertificadoImprontaDTO.VehiculoInfo vi = new CertificadoImprontaDTO.VehiculoInfo();
        vi.setPlaca(v.getMatricula());
        vi.setChasis(v.getChasis());
        vi.setMotor(v.getCodigoMotor());
        vi.setColor(v.getColor());
        vi.setAnio(v.getAnioFabricacion());
        if (v.getModeloVehiculo() != null) {
            vi.setModelo(v.getModeloVehiculo().getNombre());
            if (v.getModeloVehiculo().getMarca() != null) vi.setMarca(v.getModeloVehiculo().getMarca().getNombre());
        }
        vi.setCentroRtv(dto.getEmpresa() != null ? dto.getEmpresa().getNombre() : null);
        dto.setVehiculo(vi);

        // Tipos impronta (parsea descripción CHASIS:...|MOTOR:...)
        String desc = impronta != null ? impronta.getDescripcion() : null;
        dto.setImprontaChasisTipo(extraerValor(desc, "CHASIS"));
        dto.setImprontaMotorTipo(extraerValor(desc, "MOTOR"));
        return dto;
    }
}

