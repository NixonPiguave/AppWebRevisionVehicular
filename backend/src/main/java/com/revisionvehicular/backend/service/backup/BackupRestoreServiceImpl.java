package com.revisionvehicular.backend.service.backup;

import com.revisionvehicular.backend.dtos.backup.BackupLocalFileDTO;
import com.revisionvehicular.backend.entities.backup.BackupConfig;
import com.revisionvehicular.backend.entities.backup.BackupRecord;
import com.revisionvehicular.backend.repositories.backup.IBackupConfigRepository;
import com.revisionvehicular.backend.repositories.backup.IBackupRecordRepository;
import com.revisionvehicular.backend.security.UserDatabaseContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.nio.file.attribute.BasicFileAttributes;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class BackupRestoreServiceImpl implements IBackupRestoreService {

    @Value("${backup.pgdump.path:pg_dump}")
    private String pgDumpPath;

    @Value("${backup.db.host:localhost}")
    private String dbHost;

    @Value("${backup.db.port:5432}")
    private String dbPort;

    @Value("${backup.db.name:rtv}")
    private String dbName;

    @Value("${backup.db.username:postgres}")
    private String dbUsername;

    @Value("${backup.db.password:}")
    private String dbPassword;

    private final IBackupConfigRepository configRepository;
    private final IBackupRecordRepository recordRepository;
    private final JdbcTemplate jdbcTemplate;

    public BackupRestoreServiceImpl(IBackupConfigRepository configRepository,
                                    IBackupRecordRepository recordRepository,
                                    JdbcTemplate jdbcTemplate) {
        this.configRepository = configRepository;
        this.recordRepository = recordRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    private String getPgRestorePath() {
        if (pgDumpPath != null && pgDumpPath.contains("pg_dump")) {
            return pgDumpPath.replace("pg_dump", "pg_restore");
        }
        return "pg_restore";
    }

    private String getPsqlPath() {
        if (pgDumpPath != null && pgDumpPath.contains("pg_dump")) {
            return pgDumpPath.replace("pg_dump", "psql");
        }
        return "psql";
    }

    /** Limpia el esquema public con CASCADE para que pg_restore no tenga conflictos de FKs. */
    private void limpiarEsquemaPublico() throws Exception {
        List<String> comando = new ArrayList<>();
        comando.add(getPsqlPath());
        comando.add("-h"); comando.add(dbHost);
        comando.add("-p"); comando.add(dbPort);
        comando.add("-U"); comando.add(dbUsername);
        comando.add("-d"); comando.add(dbName);
        comando.add("-c");
        comando.add("DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public; GRANT USAGE ON SCHEMA public TO public;");

        ProcessBuilder pb = new ProcessBuilder(comando);
        pb.environment().put("PGPASSWORD", dbPassword != null ? dbPassword : "");
        pb.redirectErrorStream(true);
        Process proceso = pb.start();

        StringBuilder salida = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(proceso.getInputStream()))) {
            String linea;
            while ((linea = reader.readLine()) != null) {
                salida.append(linea).append("\n");
            }
        }
        int codigo = proceso.waitFor();
        if (codigo != 0) {
            throw new RuntimeException("Error al limpiar la base de datos antes de restaurar: " + salida.toString().trim());
        }
    }

    /** Crea la tabla srtv_sesion_usuario si no existe (respaldos antiguos pueden no incluirla). */
    private void asegurarTablaSesionUsuario() throws Exception {
        String createTable = "CREATE TABLE IF NOT EXISTS srtv_sesion_usuario (" +
                "sesion_id BIGSERIAL PRIMARY KEY, " +
                "usuario_id BIGINT NOT NULL REFERENCES srtv_usuario(usuario_id) ON DELETE CASCADE, " +
                "fecha_login TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, " +
                "ultima_actividad TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, " +
                "activo BOOLEAN NOT NULL DEFAULT TRUE)";
        ejecutarPsql(createTable);

        String createIndex = "CREATE INDEX IF NOT EXISTS idx_sesion_usuario_activo ON srtv_sesion_usuario(activo) WHERE activo = TRUE";
        ejecutarPsql(createIndex);
    }

    private void ejecutarPsql(String sql) throws Exception {
        List<String> comando = new ArrayList<>();
        comando.add(getPsqlPath());
        comando.add("-h"); comando.add(dbHost);
        comando.add("-p"); comando.add(dbPort);
        comando.add("-U"); comando.add(dbUsername);
        comando.add("-d"); comando.add(dbName);
        comando.add("-v"); comando.add("ON_ERROR_STOP=1");
        comando.add("-c"); comando.add(sql);

        ProcessBuilder pb = new ProcessBuilder(comando);
        pb.environment().put("PGPASSWORD", dbPassword != null ? dbPassword : "");
        pb.redirectErrorStream(true);
        Process proceso = pb.start();

        StringBuilder salida = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(proceso.getInputStream(), StandardCharsets.UTF_8))) {
            String linea;
            while ((linea = reader.readLine()) != null) {
                salida.append(linea).append("\n");
            }
        }
        int codigo = proceso.waitFor();
        if (codigo != 0) {
            throw new RuntimeException("Error al crear tabla de sesiones: " + salida.toString().trim());
        }
    }

    @Override
    public List<BackupLocalFileDTO> listarArchivosLocales() {
        BackupConfig config = configRepository.findTopByOrderByConfigIdDesc()
                .orElseThrow(() -> new RuntimeException("No existe configuración de backup. Configure la ruta de respaldos primero."));
        if (config.getRutaServidor() == null || config.getRutaServidor().isBlank()) {
            return List.of();
        }

        Path directorio;
        try {
            directorio = BackupDirectoryResolver.requireAbsolutePath(config.getRutaServidor().trim());
        } catch (RuntimeException e) {
            return List.of();
        }
        if (!Files.isDirectory(directorio)) {
            return List.of();
        }

        List<BackupLocalFileDTO> lista = new ArrayList<>();
        try (DirectoryStream<Path> stream = Files.newDirectoryStream(directorio, "*.backup")) {
            for (Path entry : stream) {
                if (!Files.isRegularFile(entry)) continue;
                BasicFileAttributes attrs = Files.readAttributes(entry, BasicFileAttributes.class);
                BackupLocalFileDTO dto = new BackupLocalFileDTO();
                dto.setNombreArchivo(entry.getFileName().toString());
                dto.setTamanoBytes(Files.size(entry));
                dto.setTamanoFormateado(formatearTamano(dto.getTamanoBytes()));
                dto.setFechaModificacion(attrs.lastModifiedTime().toInstant());
                lista.add(dto);
            }
        } catch (Exception e) {
            throw new RuntimeException("Error al listar archivos locales: " + e.getMessage());
        }

        lista.sort(Comparator.comparing(BackupLocalFileDTO::getFechaModificacion).reversed());
        return lista;
    }

    @Override
    public void restaurar(String nombreArchivo) {
        if (nombreArchivo == null || nombreArchivo.isBlank()) {
            throw new RuntimeException("Nombre de archivo no válido.");
        }
        if (nombreArchivo.contains("..") || nombreArchivo.contains("/") || nombreArchivo.contains("\\")) {
            throw new RuntimeException("Nombre de archivo no permitido.");
        }

        BackupConfig config = configRepository.findTopByOrderByConfigIdDesc()
                .orElseThrow(() -> new RuntimeException("No existe configuración de backup."));
        if (config.getRutaServidor() == null || config.getRutaServidor().isBlank()) {
            throw new RuntimeException("Ruta de respaldos no configurada.");
        }

        Path base = BackupDirectoryResolver.requireAbsolutePath(config.getRutaServidor().trim());
        Path archivo = base.resolve(nombreArchivo).normalize();
        if (!archivo.startsWith(base)) {
            throw new RuntimeException("Nombre de archivo no permitido.");
        }
        if (!Files.isRegularFile(archivo)) {
            throw new RuntimeException("El archivo no existe o no es accesible: " + nombreArchivo);
        }
        if (!nombreArchivo.toLowerCase().endsWith(".backup")) {
            throw new RuntimeException("Solo se pueden restaurar archivos con extensión .backup (respaldos FULL, DIFFERENTIAL o INCREMENTAL).");
        }

        try {
            ejecutarRestoreDesdeArchivo(archivo);
            // Si el respaldo estaba "en proceso", marcarlo como EXITOSO (restauración exitosa lo confirma)
            List<BackupRecord> enProceso = recordRepository.findByNombreArchivoAndEstado(nombreArchivo, "EN_PROCESO");
            long tamano = Files.size(archivo);
            String rutaServidor = archivo.toAbsolutePath().toString();
            for (BackupRecord r : enProceso) {
                r.setEstado("EXITOSO");
                r.setRutaServidor(rutaServidor);
                r.setTamanoBytes(tamano);
                r.setFinalizadoEn(LocalDateTime.now());
                r.setMensajeError(null);
                recordRepository.save(r);
            }
        } catch (Exception e) {
            if (e instanceof RuntimeException re) throw re;
            throw new RuntimeException("Error al restaurar: " + e.getMessage());
        }
    }

    @Override
    public void restaurarDesdeArchivoSubido(MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) {
            throw new RuntimeException("Debe seleccionar un archivo .backup.");
        }
        String nombre = archivo.getOriginalFilename() != null ? archivo.getOriginalFilename().trim() : "";
        if (!nombre.toLowerCase().endsWith(".backup")) {
            throw new RuntimeException("Solo se pueden restaurar archivos con extensión .backup.");
        }
        Path temporal = null;
        try {
            temporal = Files.createTempFile("restore-upload-", ".backup");
            Files.copy(archivo.getInputStream(), temporal, StandardCopyOption.REPLACE_EXISTING);
            ejecutarRestoreDesdeArchivo(temporal);
        } catch (Exception e) {
            if (e instanceof RuntimeException re) throw re;
            throw new RuntimeException("Error al restaurar archivo subido: " + e.getMessage());
        } finally {
            if (temporal != null) {
                try {
                    Files.deleteIfExists(temporal);
                } catch (Exception ignored) {
                }
            }
        }
    }

    @Override
    public Map<String, Object> diagnosticarEstadoBaseDatos() {
        String usuarioPrevio = UserDatabaseContext.getUser();
        String passwordPrevia = UserDatabaseContext.getPassword();
        try {
            // El diagnóstico debe apuntar a la misma conexión objetivo del restore
            // (backup.db.username / backup.db.password), no a un usuario dinámico del JWT.
            UserDatabaseContext.setCredentials(dbUsername, dbPassword != null ? dbPassword : "");

            Integer totalTablas = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'",
                    Integer.class
            );
            boolean tieneUsuarios = existeTabla("srtv_usuario");
            boolean tieneRoles = existeTabla("srtv_rol");
            boolean tieneUsuarioRoles = existeTabla("srtv_usuario_roles");
            boolean tieneBackupConfig = existeTabla("srtv_backup_config");
            int cantidadUsuarios = contarFilasSiExiste("srtv_usuario");
            int cantidadRoles = contarFilasSiExiste("srtv_rol");
            int cantidadUsuarioRoles = contarFilasSiExiste("srtv_usuario_roles");

            boolean requiere = !tieneUsuarios || !tieneRoles || !tieneUsuarioRoles
                    || totalTablas == null || totalTablas < 10
                    || cantidadUsuarios == 0 || cantidadRoles == 0 || cantidadUsuarioRoles == 0;
            String razon = requiere
                    ? "Se detecta base de datos vacía/incompleta (sin usuarios o roles activos de arranque). Se recomienda restaurar un respaldo."
                    : "Estructura base verificada.";

            Map<String, Object> respuesta = new LinkedHashMap<>();
            respuesta.put("requiereRestauracion", requiere);
            respuesta.put("razon", razon);
            respuesta.put("totalTablas", totalTablas == null ? 0 : totalTablas);
            respuesta.put("tieneUsuarios", tieneUsuarios);
            respuesta.put("tieneRoles", tieneRoles);
            respuesta.put("tieneUsuarioRoles", tieneUsuarioRoles);
            respuesta.put("cantidadUsuarios", cantidadUsuarios);
            respuesta.put("cantidadRoles", cantidadRoles);
            respuesta.put("cantidadUsuarioRoles", cantidadUsuarioRoles);
            respuesta.put("tieneConfigBackup", tieneBackupConfig);
            respuesta.put("tiposSoportados", List.of("FULL", "DIFFERENTIAL", "INCREMENTAL"));
            return respuesta;
        } catch (Exception e) {
            return Map.of(
                    "requiereRestauracion", true,
                    "razon", "No se pudo verificar la base de datos: " + e.getMessage(),
                    "tiposSoportados", List.of("FULL", "DIFFERENTIAL", "INCREMENTAL")
            );
        } finally {
            if (usuarioPrevio != null && passwordPrevia != null) {
                UserDatabaseContext.setCredentials(usuarioPrevio, passwordPrevia);
            } else {
                UserDatabaseContext.clear();
            }
        }
    }

    private boolean existeTabla(String nombreTabla) {
        Integer existe = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_name=?",
                Integer.class,
                nombreTabla
        );
        return existe != null && existe > 0;
    }

    private int contarFilasSiExiste(String tabla) {
        if (!existeTabla(tabla)) {
            return 0;
        }
        Integer total = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM " + tabla, Integer.class);
        return total == null ? 0 : total;
    }

    private void ejecutarRestoreDesdeArchivo(Path archivo) throws Exception {
        // 1) Limpiar esquema public con CASCADE (evita errores de FKs al restaurar)
        limpiarEsquemaPublico();

        // 2) Restaurar sin --clean (la base ya está vacía)
        String pgRestorePath = getPgRestorePath();
        List<String> comando = new ArrayList<>();
        comando.add(pgRestorePath);
        comando.add("-h"); comando.add(dbHost);
        comando.add("-p"); comando.add(dbPort);
        comando.add("-U"); comando.add(dbUsername);
        comando.add("-d"); comando.add(dbName);
        comando.add("--no-owner");
        comando.add("--no-privileges");
        comando.add(archivo.toAbsolutePath().toString());

        ProcessBuilder pb = new ProcessBuilder(comando);
        pb.environment().put("PGPASSWORD", dbPassword != null ? dbPassword : "");
        pb.redirectErrorStream(true);
        Process proceso = pb.start();

        StringBuilder salida = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(proceso.getInputStream()))) {
            String linea;
            while ((linea = reader.readLine()) != null) {
                salida.append(linea).append("\n");
            }
        }

        int codigo = proceso.waitFor();
        if (codigo != 0) {
            throw new RuntimeException("pg_restore finalizó con errores (código " + codigo + "). " +
                    "Algunos avisos son normales. Detalle: " + salida.toString().trim());
        }

        // 3) Asegurar tabla srtv_sesion_usuario (respaldos antiguos pueden no incluirla)
        asegurarTablaSesionUsuario();
    }

    private String formatearTamano(Long bytes) {
        if (bytes == null) return "—";
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        if (bytes < 1024 * 1024 * 1024) return String.format("%.1f MB", bytes / (1024.0 * 1024));
        return String.format("%.2f GB", bytes / (1024.0 * 1024 * 1024));
    }
}
