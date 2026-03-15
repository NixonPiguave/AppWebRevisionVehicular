package com.revisionvehicular.backend.service.backup;

import com.revisionvehicular.backend.dtos.backup.BackupRecordDTO;
import com.revisionvehicular.backend.entities.backup.BackupConfig;
import com.revisionvehicular.backend.entities.backup.BackupRecord;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import com.revisionvehicular.backend.repositories.backup.IBackupConfigRepository;
import com.revisionvehicular.backend.repositories.backup.IBackupRecordRepository;
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
    private final DriveStorageService driveService;
    private final IBackupNotificationService notificationService;

    public BackupServiceImpl(
            IBackupConfigRepository configRepository,
            IBackupRecordRepository recordRepository,
            DriveStorageService driveService,
            IBackupNotificationService notificationService) {
        this.configRepository = configRepository;
        this.recordRepository = recordRepository;
        this.driveService = driveService;
        this.notificationService = notificationService;
    }

    @Override
    public BackupRecordDTO ejecutarBackup(String tipo, String origen, Usuario usuario) {
        // Cargar configuración
        BackupConfig config = configRepository.findTopByOrderByConfigIdAsc()
                .orElseThrow(() -> new RuntimeException(
                        "No existe configuración de backup. Configure primero la ruta y credenciales."));

        // Verificar que no haya otro backup en proceso
        if (recordRepository.existsByEstado("EN_PROCESO")) {
            throw new RuntimeException("Ya hay un respaldo en proceso. Espere a que termine.");
        }

        // Preparar registro inicial
        BackupRecord record = new BackupRecord();
        record.setTipo(tipo);
        record.setOrigen(origen);
        record.setEstado("EN_PROCESO");
        record.setUsuario(usuario);
        record.setEjecutadoPor(usuario != null
                ? usuario.getNombre() + " " + usuario.getApellido()
                : "SCHEDULER");
        record = recordRepository.save(record);
        record.setNombreArchivo("pendiente_" + System.currentTimeMillis());

        try {
            String timestamp = LocalDateTime.now()
                    .format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String extension = tipo.equals("INCREMENTAL") ? ".tar" : ".backup";
            String nombreArchivo = String.format("backup_%s_%s%s",
                    tipo.toLowerCase(), timestamp, extension);

            Path rutaCompleta = Paths.get(config.getRutaServidor(), nombreArchivo);
            Files.createDirectories(rutaCompleta.getParent());

            switch (tipo) {
                case "FULL" -> ejecutarFull(rutaCompleta.toString());
                case "DIFFERENTIAL" -> ejecutarDiferencial(rutaCompleta.toString());
                case "INCREMENTAL" -> ejecutarIncremental(
                        rutaCompleta.getParent().toString(), nombreArchivo);
                default -> throw new RuntimeException("Tipo de backup no válido: " + tipo);
            }

            // Verificar que el archivo se creó
            File archivoGenerado = rutaCompleta.toFile();
            if (!archivoGenerado.exists()) {
                throw new RuntimeException("El archivo de backup no fue generado correctamente.");
            }

            long tamano = archivoGenerado.length();

            // Subir a Drive si está habilitado
            String driveFileId = null;
            if (Boolean.TRUE.equals(config.getDriveHabilitado())) {
                driveFileId = driveService.subirArchivo(archivoGenerado, nombreArchivo, config);
            }

            // Actualizar registro como exitoso
            record.setNombreArchivo(nombreArchivo);
            record.setRutaServidor(rutaCompleta.toString());
            record.setDriveFileId(driveFileId);
            record.setTamanoBytes(tamano);
            record.setEstado("EXITOSO");
            record.setFinalizadoEn(LocalDateTime.now());
            record = recordRepository.save(record);

        } catch (Exception e) {
            // Actualizar registro como fallido
            record.setEstado("FALLIDO");
            record.setMensajeError(e.getMessage());
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
    // DIFERENCIAL: exporta solo esquema + datos desde el
    // último backup FULL exitoso usando --exclude-table-data
    // para tablas de auditoría y datos históricos pesados.
    // Nota: pg_dump no tiene diferencial nativo — esta es
    // la aproximación más práctica sin herramientas externas.
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

        comando.add("--exclude-table=srtv_auditoria");

        ejecutarProceso(comando, dbPassword);
    }

    // -------------------------------------------------------
    // INCREMENTAL: pg_basebackup a nivel de archivos WAL
    // Requiere que PostgreSQL tenga wal_level = replica
    // -------------------------------------------------------
    private void ejecutarIncremental(String rutaDirectorio, String nombreArchivo) throws Exception {
        // Verificar que existe un FULL previo
        recordRepository.findTopByTipoAndEstadoOrderByCreadoEnDesc("FULL", "EXITOSO")
                .orElseThrow(() -> new RuntimeException(
                        "No existe un backup FULL exitoso previo. Ejecute un backup completo primero."));

        String rutaExclusiva = rutaDirectorio + File.separator + nombreArchivo.replace(".tar", "");
        Files.createDirectories(Paths.get(rutaExclusiva));

        List<String> comando = new ArrayList<>();
        comando.add(pgBaseBackupPath);
        comando.add("-h"); comando.add(dbHost);
        comando.add("-p"); comando.add(dbPort);
        comando.add("-U"); comando.add(dbUsername);
        comando.add("-D"); comando.add(rutaExclusiva); // ← usa el subdirectorio vacío
        comando.add("--checkpoint=fast");
        comando.add("--wal-method=stream");
        comando.add("-Z"); comando.add("9");
        comando.add("-F"); comando.add("t");

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
}