package com.revisionvehicular.backend.service.backup;

import com.revisionvehicular.backend.dtos.backup.BackupRecordDTO;
import com.revisionvehicular.backend.entities.backup.BackupConfig;
import com.revisionvehicular.backend.entities.backup.BackupRecord;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import com.revisionvehicular.backend.repositories.backup.IBackupConfigRepository;
import com.revisionvehicular.backend.repositories.backup.IBackupRecordRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class BackupServiceImpl implements IBackupService {

    private static final Logger log = LoggerFactory.getLogger(BackupServiceImpl.class);

    @Value("${backup.incremental.rolling-filename:backup_incremental_actual.backup}")
    private String nombreArchivoIncrementalRolling;

    // En Google Drive evitamos acumulación subiendo siempre con nombres "rolling" por tipo.
    private static final String NOMBRE_ARCHIVO_FULL_DRIVE_ROLLING = "backup_full_actual.backup";
    private static final String NOMBRE_ARCHIVO_DIFFERENCIAL_DRIVE_ROLLING = "backup_diferencial_actual.backup";

    @Value("${backup.pgdump.path}")
    private String pgDumpPath;

    @Value("${backup.pgbasebackup.path}")
    private String pgBaseBackupPath;

    @Value("${backup.db.host}")
    private String dbHost;

    @Value("${backup.db.port}")
    private String dbPort;

    @Value("${backup.db.name}")
    private String dbName;

    @Value("${backup.db.username}")
    private String dbUsername;

    @Value("${backup.db.password}")
    private String dbPassword;

    private final IBackupConfigRepository configRepository;
    private final IBackupRecordRepository recordRepository;
    private final IBackupRecordService backupRecordService;
    private final DriveStorageService driveService;
    private final IBackupNotificationService notificationService;

    public BackupServiceImpl(
            IBackupConfigRepository configRepository,
            IBackupRecordRepository recordRepository,
            IBackupRecordService backupRecordService,
            DriveStorageService driveService,
            IBackupNotificationService notificationService) {
        this.configRepository = configRepository;
        this.recordRepository = recordRepository;
        this.backupRecordService = backupRecordService;
        this.driveService = driveService;
        this.notificationService = notificationService;
    }

    /**
     * Misma resolución de ruta desde peticiones HTTP o desde Quartz: siempre absoluta respecto al cwd del proceso JVM.
     */
    private Path directorioRespaldoAbsoluto(BackupConfig config) {
        String ruta = config.getRutaServidor();
        if (ruta == null || ruta.isBlank()) {
            throw new RuntimeException("Ruta del servidor no configurada para respaldos.");
        }
        try {
            Path base = Paths.get(ruta.trim()).toAbsolutePath().normalize();
            Files.createDirectories(base);
            if (!Files.isWritable(base)) {
                throw new RuntimeException("Sin permiso de escritura en el directorio de respaldos: " + base);
            }
            return base;
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("No se pudo preparar el directorio de respaldos: " + e.getMessage(), e);
        }
    }

    @PostConstruct
    void normalizarConfigIncremental() {
        if (nombreArchivoIncrementalRolling == null || nombreArchivoIncrementalRolling.isBlank()) {
            nombreArchivoIncrementalRolling = "backup_incremental_actual.backup";
        } else {
            nombreArchivoIncrementalRolling = nombreArchivoIncrementalRolling.trim();
        }
        log.info("Respaldos INCREMENTAL usan archivo fijo (sobrescrito): {}", nombreArchivoIncrementalRolling);
    }

    @Override
    public String getNombreArchivoIncrementalRolling() {
        if (nombreArchivoIncrementalRolling == null || nombreArchivoIncrementalRolling.isBlank()) {
            return "backup_incremental_actual.backup";
        }
        return nombreArchivoIncrementalRolling;
    }

    @Override
    public BackupRecordDTO ejecutarBackup(String tipo, String origen, Usuario usuario) {
        if (tipo == null || tipo.isBlank()) {
            throw new RuntimeException("Tipo de backup no válido.");
        }
        final String tipoNorm = tipo.trim().toUpperCase();

        // Cargar configuración
        BackupConfig config = configRepository.findTopByOrderByConfigIdDesc()
                .orElseThrow(() -> new RuntimeException(
                        "No existe configuración de backup. Configure primero la ruta y credenciales."));

        // Marcar como fallidos los registros EN_PROCESO con más de 30 min (interrumpidos/obsoletos)
        LocalDateTime limiteObsoleto = LocalDateTime.now().minusMinutes(30);
        List<BackupRecord> obsoletos = recordRepository.findByEstadoAndCreadoEnBefore("EN_PROCESO", limiteObsoleto);
        for (BackupRecord r : obsoletos) {
            r.setEstado("FALLIDO");
            r.setMensajeError("Interrumpido o expirado. El respaldo no se completó en 30 minutos.");
            r.setFinalizadoEn(LocalDateTime.now());
            recordRepository.save(r);
        }

        // Verificar que no haya otro backup en proceso (realmente en curso)
        if (recordRepository.existsByEstado("EN_PROCESO")) {
            throw new RuntimeException("Ya hay un respaldo en proceso. Espere a que termine.");
        }

        // Preparar registro inicial
        BackupRecord record = new BackupRecord();
        record.setTipo(tipoNorm);
        record.setOrigen(origen);
        record.setEstado("EN_PROCESO");
        record.setUsuario(usuario);
        record.setEjecutadoPor(usuario != null
                ? usuario.getNombre() + " " + usuario.getApellido()
                : "SCHEDULER");
        record = recordRepository.save(record);

        String timestamp = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String nombreArchivo = "INCREMENTAL".equals(tipoNorm)
                ? nombreArchivoIncrementalRolling
                : String.format("backup_%s_%s.backup", tipoNorm.toLowerCase(), timestamp);
        record.setNombreArchivo(nombreArchivo);
        recordRepository.save(record);

        Path directorioBase = directorioRespaldoAbsoluto(config);
        Path rutaCompleta = directorioBase.resolve(nombreArchivo).normalize();
        if (!rutaCompleta.startsWith(directorioBase)) {
            throw new RuntimeException("Nombre de archivo de respaldo inválido.");
        }
        log.info("Respaldo {} ({}) — directorio configurado: {} — archivo: {}",
                tipoNorm, origen, directorioBase, rutaCompleta);
        try {
            Files.createDirectories(rutaCompleta.getParent());

            switch (tipoNorm) {
                case "FULL" -> ejecutarFull(rutaCompleta.toString());
                case "DIFFERENTIAL" -> ejecutarDiferencial(rutaCompleta.toString());
                case "INCREMENTAL" -> ejecutarIncremental(rutaCompleta.toString());
                default -> throw new RuntimeException("Tipo de backup no válido: " + tipoNorm);
            }

            File archivoGenerado = rutaCompleta.toFile();
            if (!archivoGenerado.exists()) {
                throw new RuntimeException("El archivo de backup no fue generado correctamente.");
            }
            String rutaFinal = rutaCompleta.toAbsolutePath().normalize().toString();
            String nombreFinal = nombreArchivo;
            long tamano = archivoGenerado.length();

            log.info("Respaldo local listo ({}): {} ({} bytes)", origen, rutaFinal, tamano);

            // Subir a Drive si está habilitado
            String driveFileId = null;
            if (Boolean.TRUE.equals(config.getDriveHabilitado())) {
                // En Drive evitamos acumulación subiendo siempre con nombres "rolling" por tipo.
                final String nombreDrive = switch (tipoNorm) {
                    case "FULL" -> NOMBRE_ARCHIVO_FULL_DRIVE_ROLLING;
                    case "DIFFERENTIAL" -> NOMBRE_ARCHIVO_DIFFERENCIAL_DRIVE_ROLLING;
                    case "INCREMENTAL" -> nombreArchivoIncrementalRolling;
                    default -> nombreFinal;
                };

                try {
                    driveFileId = driveService.subirArchivo(archivoGenerado, nombreDrive, config,
                            true);
                } catch (Exception driveEx) {
                    // Si se agotó la cuota del Service Account, limpiamos respaldos viejos y reintentamos una vez.
                    String msg = String.valueOf(driveEx.getMessage());
                    String msgLower = msg.toLowerCase();

                    boolean cuota = msgLower.contains("storagequotaexceeded")
                            || msgLower.contains("usagequota")
                            || msgLower.contains("usagelimits")
                            || msgLower.contains("quota exceeded");

                    if (!cuota) {
                        // Si falla por un motivo distinto a cuota, marcamos el respaldo como fallido
                        // porque el objetivo del modo Drive es subir al remoto.
                        throw new RuntimeException("Error al subir a Drive: " + msg);
                    }

                    // 1) Intento: borrar lo que no sea rolling y reintentar una vez.
                    try {
                        driveService.eliminarBackupsNoRolling(config, java.util.Set.of(
                                NOMBRE_ARCHIVO_FULL_DRIVE_ROLLING,
                                NOMBRE_ARCHIVO_DIFFERENCIAL_DRIVE_ROLLING,
                                nombreArchivoIncrementalRolling
                        ));
                        driveFileId = driveService.subirArchivo(archivoGenerado, nombreDrive, config, true);
                    } catch (Exception cleanupEx1) {
                        log.warn("Drive quota excedida: no se pudo recuperar tras eliminar no-rolling. Cleanup1: {}",
                                cleanupEx1.getMessage());
                    }

                    // 2) Último recurso: borrar TODOS los respaldos y reintentar una vez más.
                    try {
                        driveService.eliminarTodosBackups(config);
                        driveFileId = driveService.subirArchivo(archivoGenerado, nombreDrive, config, true);
                    } catch (Exception cleanupEx2) {
                        log.warn("Drive quota excedida: no se pudo recuperar tras eliminar TODO. Continuará sin Drive. Cleanup2: {}",
                                cleanupEx2.getMessage());
                    }

                    if (driveFileId == null) {
                        throw new RuntimeException("Drive upload falló tras limpieza por cuota. Error original: " + msg);
                    }
                }
            }

            // Actualizar registro como exitoso
            record.setNombreArchivo(nombreFinal);
            record.setRutaServidor(rutaFinal);
            record.setDriveFileId(driveFileId);
            record.setTamanoBytes(tamano);
            record.setEstado("EXITOSO");
            record.setFinalizadoEn(LocalDateTime.now());
            record = recordRepository.save(record);

            if ("INCREMENTAL".equals(tipoNorm)) {
                // La consolidación de historial no debe impedir que el backup finalice.
                // En algunas bases antiguas pueden existir referencias (FK) que impidan el borrado.
                try {
                    backupRecordService.eliminarHistorialIncrementalDuplicado(
                            record.getRecordId(), nombreArchivoIncrementalRolling);
                } catch (Exception ex) {
                    log.warn("No se pudo consolidar historial de incrementales. Se ignorará el error: {}",
                            ex.getMessage());
                }
            }

        } catch (Exception e) {
            // Actualizar registro como fallido
            record.setEstado("FALLIDO");
            record.setMensajeError(truncarMensajeError(e.getMessage()));
            record.setFinalizadoEn(LocalDateTime.now());
            record = recordRepository.save(record);
        }

        // Crear notificación en app siempre (éxito o fallo)
        // Solo para backups automáticos o si hay usuario registrado
        notificationService.crearNotificacion(record);

        return toDTO(record);
    }

    // -------------------------------------------------------
    // FULL: pg_dump completo en formato custom (comprimido)
    // -------------------------------------------------------
    private void ejecutarFull(String rutaSalida) throws Exception {
        List<String> comando = new ArrayList<>();
        comando.add(pgDumpPath);
        comando.add("-h"); comando.add(dbHost);
        comando.add("-p"); comando.add(dbPort);
        comando.add("-U"); comando.add(dbUsername);
        comando.add("-d"); comando.add(dbName);
        comando.add("-F"); comando.add("c");   // custom format — incluye compresión
        comando.add("-Z"); comando.add("9");   // nivel de compresión máximo
        comando.add("-f"); comando.add(rutaSalida);

        ejecutarProceso(comando, dbPassword);
    }

    // -------------------------------------------------------
    // DIFERENCIAL: exporta esquema + datos. No se excluye
    // srtv_auditoria para que, al restaurar, la tabla exista
    // y la aplicación pueda registrar auditoría.
    // -------------------------------------------------------
    private void ejecutarDiferencial(String rutaSalida) throws Exception {
        recordRepository.findTopByTipoAndEstadoOrderByCreadoEnDesc("FULL", "EXITOSO")
                .orElseThrow(() -> new RuntimeException(
                        "No existe un backup FULL exitoso previo. Ejecute un backup completo primero."));

        List<String> comando = new ArrayList<>();
        comando.add(pgDumpPath);
        comando.add("-h"); comando.add(dbHost);
        comando.add("-p"); comando.add(dbPort);
        comando.add("-U"); comando.add(dbUsername);
        comando.add("-d"); comando.add(dbName);
        comando.add("-F"); comando.add("c");
        comando.add("-Z"); comando.add("9");
        comando.add("-f"); comando.add(rutaSalida);

        ejecutarProceso(comando, dbPassword);
    }

    // -------------------------------------------------------
    // INCREMENTAL: pg_dump completo al mismo path en cada ejecución (archivo rotativo).
    // Misma cadencia que el programador; solo se sustituye el archivo en backup.incremental.rolling-filename.
    // -------------------------------------------------------
    private void ejecutarIncremental(String rutaSalida) throws Exception {
        List<String> comando = new ArrayList<>();
        comando.add(pgDumpPath);
        comando.add("-h"); comando.add(dbHost);
        comando.add("-p"); comando.add(dbPort);
        comando.add("-U"); comando.add(dbUsername);
        comando.add("-d"); comando.add(dbName);
        comando.add("-F"); comando.add("c");
        comando.add("-Z"); comando.add("9");
        comando.add("-f"); comando.add(rutaSalida);

        ejecutarProceso(comando, dbPassword);
    }

    // -------------------------------------------------------
    // Ejecutor genérico de procesos externos
    // -------------------------------------------------------
    private void ejecutarProceso(List<String> comando, String pgPassword) throws Exception {
        ProcessBuilder pb = new ProcessBuilder(comando);
        pb.environment().put("PGPASSWORD", pgPassword);
        pb.redirectErrorStream(true);

        Process proceso = pb.start();

        // Capturar salida para el mensaje de error si falla
        StringBuilder salida = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(proceso.getInputStream()))) {
            String linea;
            while ((linea = reader.readLine()) != null) {
                salida.append(linea).append("\n");
            }
        }

        int codigoSalida = proceso.waitFor();
        if (codigoSalida != 0) {
            throw new RuntimeException("pg_dump falló (código " + codigoSalida + "): " + salida);
        }
    }

    private BackupRecordDTO toDTO(BackupRecord record) {
        BackupRecordDTO dto = new BackupRecordDTO();
        dto.setRecordId(record.getRecordId());
        dto.setNombreArchivo(record.getNombreArchivo());
        dto.setTipo(record.getTipo());
        dto.setOrigen(record.getOrigen());
        dto.setRutaServidor(record.getRutaServidor());
        dto.setDriveFileId(record.getDriveFileId());
        dto.setTamanoBytes(record.getTamanoBytes());
        dto.setEstado(record.getEstado());
        dto.setMensajeError(record.getMensajeError());
        dto.setCreadoEn(record.getCreadoEn());
        dto.setFinalizadoEn(record.getFinalizadoEn());
        dto.setEjecutadoPor(record.getEjecutadoPor());
        dto.setTamanoFormateado(formatearTamano(record.getTamanoBytes()));
        if (record.getUsuario() != null) {
            dto.setUsuarioId(record.getUsuario().getUsuarioId());
            dto.setNombreUsuario(record.getUsuario().getNombre()
                    + " " + record.getUsuario().getApellido());
        }
        return dto;
    }

    private String formatearTamano(Long bytes) {
        if (bytes == null) return "—";
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        if (bytes < 1024 * 1024 * 1024) return String.format("%.1f MB", bytes / (1024.0 * 1024));
        return String.format("%.2f GB", bytes / (1024.0 * 1024 * 1024));
    }

    private String truncarMensajeError(String msg) {
        if (msg == null) return null;
        // srtv_backup_record.mensaje_error es varchar(1000)
        final int max = 1000;
        if (msg.length() <= max) return msg;
        return msg.substring(0, max);
    }
}