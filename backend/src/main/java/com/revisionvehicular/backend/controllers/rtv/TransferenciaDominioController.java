package com.revisionvehicular.backend.controllers.rtv;

import com.revisionvehicular.backend.dtos.cv.VehiculoDTO;
import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.entities.pv.Propietario;
import com.revisionvehicular.backend.entities.rtv.Impronta;
import com.revisionvehicular.backend.entities.srtv.Turnos;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import com.revisionvehicular.backend.repositories.pv.IPropietarioRepository;
import com.revisionvehicular.backend.repositories.rtv.IImprontaRepository;
import com.revisionvehicular.backend.repositories.srtv.ITurnosRepository;
import com.revisionvehicular.backend.service.cv.IVehiculoService;
import com.revisionvehicular.backend.service.srtv.AuditoriaService;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

/**
 * Trámite de transferencia de dominio: asigna al vehículo el propietario indicado en la ejecución
 * (elegido en pantalla), registra una nueva impronta y finaliza el turno.
 */
@RestController
@RequestMapping("/api/transferencia-dominio")
public class TransferenciaDominioController {

    private final ITurnosRepository turnosRepo;
    private final IImprontaRepository improntaRepo;
    private final IPropietarioRepository propietarioRepo;
    private final IVehiculoService vehiculoService;
    private final AuditoriaService auditoriaService;

    public TransferenciaDominioController(
            ITurnosRepository turnosRepo,
            IImprontaRepository improntaRepo,
            IPropietarioRepository propietarioRepo,
            IVehiculoService vehiculoService,
            AuditoriaService auditoriaService
    ) {
        this.turnosRepo = turnosRepo;
        this.improntaRepo = improntaRepo;
        this.propietarioRepo = propietarioRepo;
        this.vehiculoService = vehiculoService;
        this.auditoriaService = auditoriaService;
    }

    public record TurnoTransferenciaView(
            Long turnoId,
            Long solicitanteTurnoId,
            String solicitanteTurnoNombre,
            Long servicioId,
            String servicioNombre,
            String estado,
            LocalDate fechaInicio,
            Long vehiculoId,
            String vehiculoPlaca,
            String propietarioAnteriorNombre
    ) {}

    public record EjecutarRequest(Long turnoId, Long nuevoPropietarioId) {}

    public record EjecutarResponse(String mensaje, String matricula) {}

    @GetMapping("/turnos-en-proceso")
    public ResponseEntity<List<TurnoTransferenciaView>> turnosEnProceso(@RequestParam Long servicioId) {
        auditoriaService.registrar(
                "READ",
                "TransferenciaDominio",
                "Consultó turnos EN_PROCESO para transferencia de dominio (servicioId=" + servicioId + ")."
        );
        List<Turnos> turnos = turnosRepo.findByEstadoAndServicioIdConVehiculoYPropietarios(
                "EN_PROCESO", servicioId);
        List<TurnoTransferenciaView> out = turnos.stream().map(this::toView).toList();
        return ResponseEntity.ok(out);
    }

    private TurnoTransferenciaView toView(Turnos t) {
        Propietario sol = t.getPropietario();
        String solNombre = sol != null && sol.getNombre() != null ? sol.getNombre() : null;
        Vehiculo v = t.getVehiculo();
        Long vehId = v != null ? v.getVehiculoid() : null;
        String placa = v != null ? v.getMatricula() : null;
        String ant = "-";
        if (v != null && v.getPropietario() != null && v.getPropietario().getNombre() != null) {
            ant = v.getPropietario().getNombre();
        }
        return new TurnoTransferenciaView(
                t.getTurnoId(),
                sol != null ? sol.getIdPropietario() : null,
                solNombre,
                t.getServicio() != null ? t.getServicio().getIdTipoTramite() : null,
                t.getServicio() != null ? t.getServicio().getNombre() : null,
                t.getEstado(),
                t.getFechaInicio(),
                vehId,
                placa,
                ant
        );
    }

    @PostMapping("/ejecutar")
    @Transactional
    public ResponseEntity<EjecutarResponse> ejecutar(@RequestBody EjecutarRequest req) {
        if (req == null || req.turnoId == null || req.nuevoPropietarioId == null) {
            return ResponseEntity.badRequest().build();
        }
        Propietario nuevoProp = propietarioRepo.findById(req.nuevoPropietarioId).orElse(null);
        if (nuevoProp == null) {
            return ResponseEntity.notFound().build();
        }

        Turnos turno = turnosRepo.findByIdParaTransferenciaDominio(req.turnoId)
                .orElse(null);
        if (turno == null) {
            return ResponseEntity.notFound().build();
        }
        if (!"EN_PROCESO".equalsIgnoreCase(turno.getEstado())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        if (turno.getVehiculo() == null) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        Vehiculo veh = turno.getVehiculo();
        Long nuevoPropId = nuevoProp.getIdPropietario();
        Long actualPropId = veh.getPropietario() != null ? veh.getPropietario().getIdPropietario() : null;
        String matricula = veh.getMatricula();
        String nuevoNombre = nuevoProp.getNombre() != null ? nuevoProp.getNombre() : "";

        if (!Objects.equals(nuevoPropId, actualPropId)) {
            VehiculoDTO dto = vehiculoService.findById(veh.getVehiculoid());
            dto.setPropietarioId(nuevoPropId);
            vehiculoService.update(veh.getVehiculoid(), dto);

            Long usuarioId = auditoriaService.getUsuarioActual().map(Usuario::getUsuarioId).orElse(null);
            Long empresaId = null;
            String codigoMotor = dto.getCodigoMotor() != null ? dto.getCodigoMotor() : "";
            String descBase = "";
            Impronta ultima = improntaRepo
                    .findTopByVehiculo_VehiculoidOrderByFechaRegistroDesc(veh.getVehiculoid())
                    .orElse(null);
            if (ultima != null && ultima.getDescripcion() != null && !ultima.getDescripcion().isBlank()) {
                descBase = ultima.getDescripcion();
            } else {
                descBase = "CHASIS:FISICA|MOTOR:FISICA";
            }
            String descripcion = descBase + "|TRANSFERENCIA_DOMINIO:" + LocalDate.now() + ":" + nuevoNombre;
            improntaRepo.insertarImpronta(
                    LocalDateTime.now(),
                    codigoMotor,
                    descripcion,
                    veh.getVehiculoid(),
                    empresaId,
                    usuarioId,
                    "TRANSFERIDO"
            );
        }

        turnosRepo.actualizarEstado(turno.getTurnoId(), "FINALIZADO", LocalDate.now());

        auditoriaService.registrar(
                "UPDATE",
                "TransferenciaDominio",
                "Ejecutó transferencia de dominio turno " + req.turnoId + ", placa " + matricula
                        + ", nuevo propietario ID " + nuevoPropId + " (" + nuevoNombre + ")."
        );

        return ResponseEntity.ok(new EjecutarResponse(
                "Transferencia registrada. El vehículo quedó a nombre del propietario seleccionado.",
                matricula
        ));
    }
}
