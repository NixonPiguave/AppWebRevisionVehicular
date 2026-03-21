package com.revisionvehicular.backend.controllers.rtv;

import com.revisionvehicular.backend.dtos.cv.VehiculoDTO;
import com.revisionvehicular.backend.entities.ant.PlacaDisponible;
import com.revisionvehicular.backend.entities.pv.Propietario;
import com.revisionvehicular.backend.entities.rtv.RegistroBaseUnicaVehiculo;
import com.revisionvehicular.backend.entities.srtv.Turnos;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import com.revisionvehicular.backend.repositories.ant.IPlacaDisponibleRepository;
import com.revisionvehicular.backend.repositories.cv.IVehiculoRepository;
import com.revisionvehicular.backend.repositories.rtv.IRegistroBaseUnicaVehiculoRepository;
import com.revisionvehicular.backend.repositories.srtv.ITurnosRepository;
import com.revisionvehicular.backend.service.cv.IVehiculoService;
import com.revisionvehicular.backend.repositories.rtv.IImprontaRepository;
import com.revisionvehicular.backend.service.srtv.AuditoriaService;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/api/registro-vehicular-base-unica")
public class RegistroVehicularBaseUnicaController {

    private final ITurnosRepository turnosRepo;
    private final IVehiculoService vehiculoService;
    private final IVehiculoRepository vehiculoRepo;
    private final IPlacaDisponibleRepository placaDisponibleRepo;
    private final IRegistroBaseUnicaVehiculoRepository registroBaseUnicaRepo;
    private final IImprontaRepository improntaRepo;
    private final AuditoriaService auditoriaService;
    private final SecureRandom rnd = new SecureRandom();

    public RegistroVehicularBaseUnicaController(
            ITurnosRepository turnosRepo,
            IVehiculoService vehiculoService,
            IVehiculoRepository vehiculoRepo,
            IPlacaDisponibleRepository placaDisponibleRepo,
            IRegistroBaseUnicaVehiculoRepository registroBaseUnicaRepo,
            IImprontaRepository improntaRepo,
            AuditoriaService auditoriaService
    ) {
        this.turnosRepo = turnosRepo;
        this.vehiculoService = vehiculoService;
        this.vehiculoRepo = vehiculoRepo;
        this.placaDisponibleRepo = placaDisponibleRepo;
        this.registroBaseUnicaRepo = registroBaseUnicaRepo;
        this.improntaRepo = improntaRepo;
        this.auditoriaService = auditoriaService;
    }

    public record TurnoRegistroView(
            Long turnoId,
            Long propietarioId,
            String propietarioNombre,
            Long servicioId,
            String servicioNombre,
            String estado,
            LocalDate fechaInicio
    ) {}

    @GetMapping("/turnos-en-proceso")
    public ResponseEntity<List<TurnoRegistroView>> turnosEnProceso(@RequestParam Long servicioId) {
        List<Turnos> turnos = turnosRepo.findByEstadoAndServicio_IdTipoTramiteOrderByFechaInicioDesc("EN_PROCESO", servicioId);
        List<TurnoRegistroView> out = turnos.stream().map(t -> {
            Propietario p = t.getPropietario();
            String nombre = p != null ? (p.getNombre() != null ? p.getNombre() : "") : "-";
            return new TurnoRegistroView(
                    t.getTurnoId(),
                    p != null ? p.getIdPropietario() : null,
                    nombre,
                    t.getServicio() != null ? t.getServicio().getIdTipoTramite() : null,
                    t.getServicio() != null ? t.getServicio().getNombre() : null,
                    t.getEstado(),
                    t.getFechaInicio()
            );
        }).toList();
        return ResponseEntity.ok(out);
    }

    public record RegistrarRequest(
            Long turnoId,
            Long placaDisponibleId,
            VehiculoDTO vehiculo,
            String improntaChasisTipo,
            String improntaMotorTipo
    ) {}

    public record RegistrarResponse(
            Long turnoId,
            Long vehiculoId,
            String placaActual,
            String numeroMatriculaVehicular
    ) {}

    @PostMapping("/registrar")
    @Transactional
    public ResponseEntity<RegistrarResponse> registrar(@RequestBody RegistrarRequest req) {
        if (req == null || req.turnoId == null || req.placaDisponibleId == null || req.vehiculo == null) {
            return ResponseEntity.badRequest().build();
        }
        Turnos turno = turnosRepo.findById(req.turnoId).orElse(null);
        if (turno == null) return ResponseEntity.notFound().build();
        if (!"EN_PROCESO".equalsIgnoreCase(turno.getEstado())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        PlacaDisponible placa = placaDisponibleRepo.findById(req.placaDisponibleId).orElse(null);
        if (placa == null || !"DISPONIBLE".equalsIgnoreCase(placa.getEstado())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        // Autocompletar propietario desde turno (prioridad sobre lo que venga en el request)
        Long propietarioId = turno.getPropietario() != null ? turno.getPropietario().getIdPropietario() : null;
        if (propietarioId == null) return ResponseEntity.status(HttpStatus.CONFLICT).build();

        VehiculoDTO v = req.vehiculo;
        v.setPropietarioId(propietarioId);
        v.setMatricula(placa.getSerieAlfanumerica());
        v.setPlacaAnterior(placa.getSerieAlfanumerica());
        if (v.getNumeroMatriculaVehicular() == null || v.getNumeroMatriculaVehicular().isBlank()) {
            v.setNumeroMatriculaVehicular(generarNumeroMatriculaUnico());
        }

        VehiculoDTO creado = vehiculoService.save(v);

        // ligar turno -> vehículo
        turnosRepo.asignarVehiculo(turno.getTurnoId(), creado.getId());

        // consumir placa disponible
        placa.setEstado("ASIGNADA");
        placaDisponibleRepo.save(placa);

        // crear impronta (descriptor mínimo para certificados)
        Long usuarioId = auditoriaService.getUsuarioActual().map(Usuario::getUsuarioId).orElse(null);
        Long empresaId = null;
        String desc = ("CHASIS:" + (req.improntaChasisTipo == null ? "" : req.improntaChasisTipo) +
                "|MOTOR:" + (req.improntaMotorTipo == null ? "" : req.improntaMotorTipo)).trim();
        improntaRepo.insertarImpronta(
                LocalDateTime.now(),
                creado.getCodigoMotor(),
                desc,
                creado.getId(),
                empresaId,
                usuarioId,
                "REGISTRADO"
        );

        // crear registro en base única (ligado al vehículo creado)
        RegistroBaseUnicaVehiculo r = new RegistroBaseUnicaVehiculo();
        r.setTipoOrigen("NUEVO");
        r.setDocumentoOrigen(null);
        r.setFechaRegistro(LocalDate.now());
        r.setEstado("REGISTRADO");
        r.setVehiculo(vehiculoRepo.findById(creado.getId()).orElse(null));
        r.setTramite(turno.getTramite());
        r.setUsuario(auditoriaService.getUsuarioActual().orElse(null));
        registroBaseUnicaRepo.save(r);

        // Actualizar estado del turno a FINALIZADO para que deje de mostrarse en turnos EN_PROCESO
        turnosRepo.actualizarEstado(turno.getTurnoId(), "FINALIZADO", LocalDate.now());

        return ResponseEntity.ok(new RegistrarResponse(
                turno.getTurnoId(),
                creado.getId(),
                creado.getMatricula(),
                creado.getNumeroMatriculaVehicular()
        ));
    }

    private String generarNumeroMatriculaUnico() {
        for (int intentos = 0; intentos < 2000; intentos++) {
            int num = 1_000_000 + rnd.nextInt(9_000_000); // 7 dígitos
            String cand = String.valueOf(num);
            if (!vehiculoRepo.existsByNumeroMatriculaVehicular(cand)) return cand;
        }
        throw new RuntimeException("No se pudo generar una matrícula vehicular única.");
    }
}

