package com.revisionvehicular.backend.controllers.ant;

import com.revisionvehicular.backend.entities.ant.PlacaDisponible;
import com.revisionvehicular.backend.entities.ant.PlacaSecuencia;
import com.revisionvehicular.backend.entities.ant.SolicitudPlacasAnt;
import com.revisionvehicular.backend.repositories.ant.IPlacaDisponibleRepository;
import com.revisionvehicular.backend.repositories.ant.IPlacaSecuenciaRepository;
import com.revisionvehicular.backend.repositories.ant.ISolicitudPlacasAntRepository;
import com.revisionvehicular.backend.repositories.cv.IVehiculoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/api/ant/solicitudes-placas")
public class SolicitudesPlacasController {

    private final ISolicitudPlacasAntRepository solicitudRepo;
    private final IPlacaDisponibleRepository placaDisponibleRepo;
    private final IPlacaSecuenciaRepository secuenciaRepo;
    private final IVehiculoRepository vehiculoRepo;
    private final SecureRandom rnd = new SecureRandom();

    public SolicitudesPlacasController(
            ISolicitudPlacasAntRepository solicitudRepo,
            IPlacaDisponibleRepository placaDisponibleRepo,
            IPlacaSecuenciaRepository secuenciaRepo,
            IVehiculoRepository vehiculoRepo
    ) {
        this.solicitudRepo = solicitudRepo;
        this.placaDisponibleRepo = placaDisponibleRepo;
        this.secuenciaRepo = secuenciaRepo;
        this.vehiculoRepo = vehiculoRepo;
    }

    public record CrearSolicitudPlacasRequest(Integer cantidad, String letraProvincia, String tipoServicio) {}

    @PostMapping
    public ResponseEntity<SolicitudPlacasAnt> crear(@RequestBody CrearSolicitudPlacasRequest req) {
        int cantidad = (req.cantidad == null ? 0 : req.cantidad);
        if (cantidad <= 0 || cantidad > 500) {
            return ResponseEntity.badRequest().build();
        }
        String provincia = normalizarProvincia(req.letraProvincia);
        String tipoServicio = normalizarTipoServicio(req.tipoServicio);
        if (provincia == null || tipoServicio == null) {
            return ResponseEntity.badRequest().build();
        }
        SolicitudPlacasAnt s = new SolicitudPlacasAnt();
        s.setCantidad(cantidad);
        s.setLetraProvincia(provincia);
        s.setTipoServicio(tipoServicio);
        s.setFechaSolicitud(LocalDateTime.now());
        s.setEstado("PENDIENTE");
        return new ResponseEntity<>(solicitudRepo.save(s), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<SolicitudPlacasAnt>> listar(@RequestParam(required = false) String estado) {
        if (estado != null && !estado.isBlank()) {
            return ResponseEntity.ok(solicitudRepo.findByEstadoOrderByFechaSolicitudDesc(estado.toUpperCase(Locale.ROOT)));
        }
        return ResponseEntity.ok(solicitudRepo.findAll());
    }

    @PostMapping("/{id}/recibir")
    @Transactional
    public ResponseEntity<List<PlacaDisponible>> recibir(@PathVariable Long id) {
        SolicitudPlacasAnt s = solicitudRepo.findById(id).orElse(null);
        if (s == null) return ResponseEntity.notFound().build();
        if (!"PENDIENTE".equalsIgnoreCase(s.getEstado())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        List<PlacaDisponible> creadas = new java.util.ArrayList<>();
        for (int i = 0; i < s.getCantidad(); i++) {
            String serie = generarSerieUnica(s.getLetraProvincia(), s.getTipoServicio());
            PlacaDisponible pd = new PlacaDisponible();
            pd.setSerieAlfanumerica(serie);
            pd.setLetraProvincia(s.getLetraProvincia());
            pd.setTipoServicio(s.getTipoServicio());
            pd.setLetraSecuencial(serie.substring(2, 3));
            pd.setFechaRecepcion(LocalDateTime.now());
            pd.setEstado("DISPONIBLE");
            creadas.add(placaDisponibleRepo.save(pd));
        }
        s.setEstado("RECIBIDO");
        solicitudRepo.save(s);
        return ResponseEntity.ok(creadas);
    }

    private String generarSerieUnica(String letraProvincia, String tipoServicio) {
        String segundaLetra = mapSegundaLetra(tipoServicio);
        String terceraLetra = siguienteLetraSecuencial(letraProvincia, tipoServicio);
        // 4 dígitos únicos (0001-9999)
        for (int intentos = 0; intentos < 2000; intentos++) {
            int num = 1 + rnd.nextInt(9999);
            String serie = (letraProvincia + segundaLetra + terceraLetra + String.format("%04d", num)).toUpperCase(Locale.ROOT);
            if (esSerieLibre(serie)) return serie;
        }
        throw new RuntimeException("No se pudo generar una placa única.");
    }

    private boolean esSerieLibre(String serie) {
        if (placaDisponibleRepo.existsBySerieAlfanumerica(serie)) return false;
        // Evitar colisiones con placas ya asignadas en vehículos
        return vehiculoRepo.findByMatriculaContainingIgnoreCase(serie).stream()
                .noneMatch(v -> serie.equalsIgnoreCase(v.getMatricula()));
    }

    private String siguienteLetraSecuencial(String provincia, String tipoServicio) {
        PlacaSecuencia seq = secuenciaRepo.findByLetraProvinciaAndTipoServicio(provincia, tipoServicio)
                .orElseGet(() -> {
                    PlacaSecuencia s = new PlacaSecuencia();
                    s.setLetraProvincia(provincia);
                    s.setTipoServicio(tipoServicio);
                    s.setIndiceActual(0);
                    return secuenciaRepo.save(s);
                });
        int idx = seq.getIndiceActual() == null ? 0 : seq.getIndiceActual();
        String letra = String.valueOf((char) ('A' + (idx % 26)));
        seq.setIndiceActual((idx + 1) % 26);
        secuenciaRepo.save(seq);
        return letra;
    }

    private String mapSegundaLetra(String tipoServicio) {
        String t = tipoServicio.toUpperCase(Locale.ROOT);
        if (t.contains("PART")) return "P";
        if (t.contains("PUB")) return "U";
        if (t.contains("EST")) return "E";
        return "X";
    }

    private String normalizarProvincia(String p) {
        if (p == null) return null;
        String s = p.trim().toUpperCase(Locale.ROOT);
        if (s.isEmpty()) return null;
        // aceptar "A", "P", "G", etc.
        return s.substring(0, 1);
    }

    private String normalizarTipoServicio(String t) {
        if (t == null) return null;
        String s = t.trim().toUpperCase(Locale.ROOT);
        if (s.isEmpty()) return null;
        return s;
    }
}

