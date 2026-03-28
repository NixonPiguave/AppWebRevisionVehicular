package com.revisionvehicular.backend.controllers.admin;

import com.revisionvehicular.backend.dtos.admin.CrearRolPostgresRequest;
import com.revisionvehicular.backend.dtos.admin.PostgresRolPrivilegiosActualesDTO;
import com.revisionvehicular.backend.dtos.admin.PostgresTablaDTO;
import com.revisionvehicular.backend.dtos.admin.SincronizarPrivilegiosPostgresRequest;
import com.revisionvehicular.backend.dtos.admin.TablaPermisosItemDTO;
import com.revisionvehicular.backend.service.admin.PostgresRolAdminService;
import com.revisionvehicular.backend.service.srtv.AuditoriaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/postgres-roles")
public class PostgresRolAdminController {

    private final PostgresRolAdminService postgresRolAdminService;
    private final AuditoriaService auditoriaService;

    @Value("${admin.postgres-roles.enabled:true}")
    private boolean featureEnabled;

    public PostgresRolAdminController(PostgresRolAdminService postgresRolAdminService,
                                      AuditoriaService auditoriaService) {
        this.postgresRolAdminService = postgresRolAdminService;
        this.auditoriaService = auditoriaService;
    }

    /** Roles cuyo nombre coincide con el prefijo {@code rol_} (sin distinguir mayúsculas al inicio). */
    @GetMapping
    public List<String> listarRolesConPrefijoRol() {
        assertFeature();
        return postgresRolAdminService.listarRolesConPrefijoRol();
    }

    @GetMapping("/tablas")
    public List<PostgresTablaDTO> listarTablas() {
        assertFeature();
        return postgresRolAdminService.listarTablasUsuario();
    }

    @GetMapping("/{nombreRol}/privilegios-actuales")
    public PostgresRolPrivilegiosActualesDTO privilegiosActuales(@PathVariable String nombreRol) {
        assertFeature();
        try {
            return postgresRolAdminService.obtenerPrivilegiosActuales(nombreRol);
        } catch (IllegalStateException e) {
            if (e.getMessage() != null && e.getMessage().startsWith("No existe")) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
            }
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage(), e);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> crearRol(@Valid @RequestBody CrearRolPostgresRequest request) {
        assertFeature();
        try {
            postgresRolAdminService.crearRolConPrivilegios(request);
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage(), e);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
        }
        auditoriaService.registrar(
                "INSERT",
                "RolPostgreSQL",
                request.getNombreRol() + " — permisos por tabla: " + resumenPermisosPorTabla(request.getPermisosPorTabla()));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("mensaje", "Rol de PostgreSQL creado correctamente.", "rol", request.getNombreRol()));
    }

    @PutMapping("/privilegios")
    public ResponseEntity<Map<String, String>> sincronizarPrivilegios(@Valid @RequestBody SincronizarPrivilegiosPostgresRequest request) {
        assertFeature();
        try {
            postgresRolAdminService.sincronizarPrivilegiosRol(request);
        } catch (IllegalStateException e) {
            if (e.getMessage() != null && e.getMessage().startsWith("No existe")) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
            }
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage(), e);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
        }
        List<TablaPermisosItemDTO> items = request.getPermisosPorTabla();
        boolean alguno = items != null
                && items.stream().anyMatch(TablaPermisosItemDTO::tieneAlgunPrivilegio);
        auditoriaService.registrar(
                "UPDATE",
                "RolPostgreSQL",
                request.getNombreRol()
                        + " — sincronizar permisos: "
                        + (alguno ? resumenPermisosPorTabla(items) : "(ninguno; revocados en esquemas de usuario)"));
        return ResponseEntity.ok(Map.of("mensaje", "Privilegios del rol actualizados.", "rol", request.getNombreRol()));
    }

    private static String resumenPrivilegios(boolean ps, boolean pi, boolean pu, boolean pd) {
        StringBuilder sb = new StringBuilder();
        if (ps) {
            sb.append("SELECT ");
        }
        if (pi) {
            sb.append("INSERT ");
        }
        if (pu) {
            sb.append("UPDATE ");
        }
        if (pd) {
            sb.append("DELETE ");
        }
        return sb.toString().trim();
    }

    /** Texto compacto para auditoría: una entrada por tabla con privilegios true. */
    private static String resumenPermisosPorTabla(List<TablaPermisosItemDTO> items) {
        if (items == null || items.isEmpty()) {
            return "(lista vacía)";
        }
        List<TablaPermisosItemDTO> con = items.stream()
                .filter(TablaPermisosItemDTO::tieneAlgunPrivilegio)
                .collect(Collectors.toList());
        if (con.isEmpty()) {
            return "(sin privilegios en ninguna fila)";
        }
        final int maxFilas = 12;
        StringBuilder sb = new StringBuilder();
        int n = Math.min(con.size(), maxFilas);
        for (int i = 0; i < n; i++) {
            TablaPermisosItemDTO t = con.get(i);
            if (i > 0) {
                sb.append("; ");
            }
            sb.append(t.getEsquema())
                    .append('.')
                    .append(t.getNombreTabla())
                    .append(": ")
                    .append(resumenPrivilegios(
                            t.isPrivilegioSelect(),
                            t.isPrivilegioInsert(),
                            t.isPrivilegioUpdate(),
                            t.isPrivilegioDelete()));
        }
        if (con.size() > maxFilas) {
            sb.append(" … (+").append(con.size() - maxFilas).append(" tablas más)");
        }
        return sb.toString();
    }

    private void assertFeature() {
        if (!featureEnabled) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "La administración de roles PostgreSQL está deshabilitada.");
        }
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Map<String, String> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> err = new HashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            err.put(fe.getField(), fe.getDefaultMessage());
        }
        if (!err.containsKey("mensaje")) {
            err.put("mensaje", "Datos no válidos: revise privilegios y selección de tablas.");
        }
        return err;
    }
}
