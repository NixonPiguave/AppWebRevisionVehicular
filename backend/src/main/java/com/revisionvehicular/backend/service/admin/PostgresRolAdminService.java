package com.revisionvehicular.backend.service.admin;

import com.revisionvehicular.backend.dtos.admin.CrearRolPostgresRequest;
import com.revisionvehicular.backend.dtos.admin.PostgresRolPrivilegiosActualesDTO;
import com.revisionvehicular.backend.dtos.admin.PostgresTablaDTO;
import com.revisionvehicular.backend.dtos.admin.PostgresTablaPrivilegioDetalleDTO;
import com.revisionvehicular.backend.dtos.admin.SincronizarPrivilegiosPostgresRequest;
import com.revisionvehicular.backend.dtos.admin.TablaPermisosItemDTO;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Crea roles de PostgreSQL y gestiona GRANT/REVOKE por tabla (permisos DML independientes por tabla).
 */
@Service
public class PostgresRolAdminService {

    private static final String SQL_TABLAS = """
            SELECT table_schema AS esquema, table_name AS nombre_tabla
            FROM information_schema.tables
            WHERE table_type = 'BASE TABLE'
              AND table_schema NOT IN ('pg_catalog', 'information_schema')
            ORDER BY table_schema, table_name
            """;

    private static final String SQL_ROLES_PREFIJO_ROL = """
            SELECT rolname FROM pg_roles
            WHERE rolname ~* '^rol_'
            ORDER BY rolname
            """;

    private static final String SQL_GRANTS_ROL_TABLAS = """
            SELECT table_schema, table_name, privilege_type
            FROM information_schema.role_table_grants
            WHERE grantee = ?
              AND table_schema NOT IN ('pg_catalog', 'information_schema')
            """;

    private static final Set<String> PRIVILEGIOS_DML_TABLA = Set.of("SELECT", "INSERT", "UPDATE", "DELETE");

    private final JdbcTemplate jdbcTemplate;

    public PostgresRolAdminService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<String> listarRolesConPrefijoRol() {
        return jdbcTemplate.query(SQL_ROLES_PREFIJO_ROL, (rs, i) -> rs.getString("rolname"));
    }

    public List<PostgresTablaDTO> listarTablasUsuario() {
        return jdbcTemplate.query(SQL_TABLAS, (rs, i) ->
                new PostgresTablaDTO(rs.getString("esquema"), rs.getString("nombre_tabla")));
    }

    public boolean existeRol(String nombreRol) {
        Integer n = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM pg_roles WHERE rolname = ?",
                Integer.class,
                nombreRol);
        return n != null && n > 0;
    }

    /**
     * Solo tablas con al menos un privilegio en el catálogo de la aplicación.
     */
    public PostgresRolPrivilegiosActualesDTO obtenerPrivilegiosActuales(String nombreRol) {
        if (nombreRol == null || !nombreRol.trim().regionMatches(true, 0, "rol_", 0, 4)) {
            throw new IllegalArgumentException("Solo se pueden consultar roles cuyo nombre comience por «rol_».");
        }
        String rol = nombreRol.trim();
        if (!existeRol(rol)) {
            throw new IllegalStateException("No existe el rol «" + rol + "» en PostgreSQL.");
        }

        List<PostgresTablaDTO> catalog = listarTablasUsuario();
        Set<String> catalogKeys = catalog.stream()
                .map(t -> t.esquema() + "." + t.nombreTabla())
                .collect(Collectors.toCollection(LinkedHashSet::new));

        Map<String, Set<String>> grantsByTable = jdbcTemplate.query(
                SQL_GRANTS_ROL_TABLAS,
                rs -> {
                    Map<String, Set<String>> m = new HashMap<>();
                    while (rs.next()) {
                        String schema = rs.getString("table_schema");
                        String table = rs.getString("table_name");
                        String priv = rs.getString("privilege_type").toUpperCase(Locale.ROOT);
                        if (!PRIVILEGIOS_DML_TABLA.contains(priv)) {
                            continue;
                        }
                        String key = schema + "." + table;
                        if (!catalogKeys.contains(key)) {
                            continue;
                        }
                        m.computeIfAbsent(key, k -> new HashSet<>()).add(priv);
                    }
                    return m;
                },
                rol);

        Set<String> tablesWithPriv = new LinkedHashSet<>(grantsByTable.keySet());

        List<PostgresTablaPrivilegioDetalleDTO> detalle = tablesWithPriv.stream()
                .sorted()
                .map(k -> {
                    String[] parts = k.split("\\.", 2);
                    Set<String> p = grantsByTable.get(k);
                    return new PostgresTablaPrivilegioDetalleDTO(
                            parts[0],
                            parts[1],
                            p.contains("SELECT"),
                            p.contains("INSERT"),
                            p.contains("UPDATE"),
                            p.contains("DELETE"));
                })
                .toList();

        return new PostgresRolPrivilegiosActualesDTO(rol, detalle);
    }

    @Transactional(rollbackFor = Exception.class)
    public void crearRolConPrivilegios(CrearRolPostgresRequest req) {
        String rol = req.getNombreRol();
        if (existeRol(rol)) {
            throw new IllegalStateException("Ya existe un rol de PostgreSQL con el nombre «" + rol + "».");
        }

        jdbcTemplate.execute("CREATE ROLE " + citarIdent(rol));

        String baseDatos = jdbcTemplate.queryForObject("SELECT current_database()", String.class);
        jdbcTemplate.execute("GRANT CONNECT ON DATABASE " + citarIdent(baseDatos) + " TO " + citarIdent(rol));

        otorgarPermisosPorTablaItems(rol, req.getPermisosPorTabla());

        insertarSrtvPermisoSiAplica(rol);
    }

    @Transactional(rollbackFor = Exception.class)
    public void sincronizarPrivilegiosRol(SincronizarPrivilegiosPostgresRequest req) {
        String rol = req.getNombreRol();
        if (!rol.regionMatches(true, 0, "rol_", 0, 4)) {
            throw new IllegalArgumentException("Solo se pueden sincronizar roles cuyo nombre comience por «rol_».");
        }
        if (!existeRol(rol)) {
            throw new IllegalStateException("No existe el rol «" + rol + "» en PostgreSQL.");
        }

        revocarPrivilegiosTablasEnEsquemasUsuario(rol);

        List<TablaPermisosItemDTO> items = req.getPermisosPorTabla();
        if (items != null && !items.isEmpty()) {
            otorgarPermisosPorTablaItems(rol, items);
        }
    }

    private void revocarPrivilegiosTablasEnEsquemasUsuario(String rol) {
        String qrol = citarIdent(rol);
        List<String> esquemas = esquemasConTablasUsuario();
        for (String esquema : esquemas) {
            String qsch = citarIdent(esquema);
            jdbcTemplate.execute("REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA " + qsch + " FROM " + qrol);
            jdbcTemplate.execute("REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA " + qsch + " FROM " + qrol);
            jdbcTemplate.execute("REVOKE USAGE ON SCHEMA " + qsch + " FROM " + qrol);
        }
    }

    private List<String> esquemasConTablasUsuario() {
        return listarTablasUsuario().stream()
                .map(PostgresTablaDTO::esquema)
                .distinct()
                .collect(Collectors.toCollection(ArrayList::new));
    }

    /**
     * Solo aplica filas con al menos un privilegio true. Valida que cada tabla exista en el catálogo.
     */
    private void otorgarPermisosPorTablaItems(String rol, List<TablaPermisosItemDTO> items) {
        List<TablaPermisosItemDTO> conPrivilegio = items.stream()
                .filter(TablaPermisosItemDTO::tieneAlgunPrivilegio)
                .toList();
        if (conPrivilegio.isEmpty()) {
            return;
        }

        validarItemsEnCatalogo(conPrivilegio);

        Set<String> esquemas = new LinkedHashSet<>();
        Set<String> esquemasConEscritura = new LinkedHashSet<>();
        for (TablaPermisosItemDTO i : conPrivilegio) {
            esquemas.add(i.getEsquema());
            if (i.isPrivilegioInsert() || i.isPrivilegioUpdate() || i.isPrivilegioDelete()) {
                esquemasConEscritura.add(i.getEsquema());
            }
        }

        String qrol = citarIdent(rol);
        for (String esquema : esquemas) {
            jdbcTemplate.execute("GRANT USAGE ON SCHEMA " + citarIdent(esquema) + " TO " + qrol);
        }

        for (TablaPermisosItemDTO i : conPrivilegio) {
            String priv = construirListaPrivilegios(
                    i.isPrivilegioSelect(),
                    i.isPrivilegioInsert(),
                    i.isPrivilegioUpdate(),
                    i.isPrivilegioDelete());
            String fqtn = citarIdent(i.getEsquema()) + "." + citarIdent(i.getNombreTabla());
            jdbcTemplate.execute("GRANT " + priv + " ON TABLE " + fqtn + " TO " + qrol);
        }

        for (String esquema : esquemasConEscritura) {
            jdbcTemplate.execute(
                    "GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA " + citarIdent(esquema) + " TO " + qrol);
        }
    }

    private void validarItemsEnCatalogo(List<TablaPermisosItemDTO> items) {
        List<PostgresTablaDTO> reales = listarTablasUsuario();
        Set<String> claves = reales.stream()
                .map(t -> t.esquema() + "." + t.nombreTabla())
                .collect(Collectors.toSet());
        for (TablaPermisosItemDTO i : items) {
            String clave = i.getEsquema() + "." + i.getNombreTabla();
            if (!claves.contains(clave)) {
                throw new IllegalArgumentException("La tabla no existe o no es accesible: " + clave);
            }
        }
    }

    private static String construirListaPrivilegios(boolean sel, boolean ins, boolean upd, boolean del) {
        List<String> p = new ArrayList<>();
        if (sel) {
            p.add("SELECT");
        }
        if (ins) {
            p.add("INSERT");
        }
        if (upd) {
            p.add("UPDATE");
        }
        if (del) {
            p.add("DELETE");
        }
        if (p.isEmpty()) {
            throw new IllegalStateException("Sin privilegios de tabla.");
        }
        return String.join(", ", p);
    }

    private static String citarIdent(String ident) {
        if (ident == null || !ident.matches("^[a-zA-Z_][a-zA-Z0-9_]{0,62}$")) {
            throw new IllegalArgumentException("Identificador no permitido: " + ident);
        }
        return "\"" + ident.replace("\"", "\"\"") + "\"";
    }

    /** Siempre tras crear el rol en PostgreSQL: catálogo de la app (ON CONFLICT nombre DO NOTHING). */
    private void insertarSrtvPermisoSiAplica(String nombreRol) {
        String modulo = nombreRol.toUpperCase().replaceFirst("^ROL_", "");
        String descripcion = "Rol PostgreSQL: " + nombreRol;
        try {
            jdbcTemplate.update(
                    """
                            INSERT INTO srtv_permiso (modulo, descripcion, nombre, estado)
                            VALUES (?,?,?, 'ACTIVO')
                            ON CONFLICT (nombre) DO NOTHING
                            """,
                    modulo,
                    descripcion,
                    nombreRol);
        } catch (DataAccessException e) {
            throw new IllegalStateException(
                    "No se pudo insertar en srtv_permiso. El rol ya fue creado en PostgreSQL. Detalle: " + e.getMostSpecificCause().getMessage(),
                    e);
        }
    }
}
