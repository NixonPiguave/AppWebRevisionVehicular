package com.revisionvehicular.backend.controllers.backup;

import com.revisionvehicular.backend.dtos.backup.BackupConfigDTO;
import com.revisionvehicular.backend.dtos.backup.FolderItemDTO;
import com.revisionvehicular.backend.entities.backup.BackupConfig;
import com.revisionvehicular.backend.service.backup.FolderBrowserService;
import com.revisionvehicular.backend.service.backup.IBackupConfigService;
import com.revisionvehicular.backend.service.backup.IBackupService;
import com.revisionvehicular.backend.service.backup.DriveStorageService;
import com.revisionvehicular.backend.service.srtv.AuditoriaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/backup/config")
public class BackupConfigController {

    private final IBackupConfigService service;
    private final IBackupService backupService;
    private final AuditoriaService auditoriaService;
    private final FolderBrowserService folderBrowserService;
    private final DriveStorageService driveStorageService;

    public BackupConfigController(IBackupConfigService service,
                                  IBackupService backupService,
                                  AuditoriaService auditoriaService,
                                  FolderBrowserService folderBrowserService,
                                  DriveStorageService driveStorageService) {
        this.service = service;
        this.backupService = backupService;
        this.auditoriaService = auditoriaService;
        this.folderBrowserService = folderBrowserService;
        this.driveStorageService = driveStorageService;
    }

    /** Lista carpetas del servidor: raíces si path vacío, o subcarpetas del path indicado. */
    @GetMapping("/folders")
    public ResponseEntity<List<FolderItemDTO>> listarCarpetas(@RequestParam(required = false) String path) {
        return ResponseEntity.ok(folderBrowserService.listarCarpetas(path));
    }

    @PostMapping("/probar-correo")
    public ResponseEntity<Void> probarCorreo(@RequestBody BackupConfigDTO dto) {
        service.probarCorreo(dto);
        auditoriaService.registrar("UPDATE", "Configuración respaldo", "Prueba de correo de notificaciones");
        return ResponseEntity.ok().build();
    }

    /**
     * Nombre de archivo fijo para respaldos INCREMENTAL (misma ruta que usa {@link IBackupService#ejecutarBackup}).
     * Expuesto aquí porque comparte base con el resto de config de respaldo (evita 404 por rutas conflictivas).
     */
    @GetMapping("/incremental-archivo")
    public ResponseEntity<Map<String, String>> incrementalArchivoConfigurado() {
        return ResponseEntity.ok(Map.of(
                "nombreArchivo", backupService.getNombreArchivoIncrementalRolling()));
    }

    @GetMapping
    public ResponseEntity<BackupConfigDTO> obtener() {
        return ResponseEntity.ok(service.obtenerConfig());
    }

    @PostMapping
    public ResponseEntity<BackupConfigDTO> guardar(@RequestBody BackupConfigDTO dto) {
        BackupConfigDTO guardado = service.guardarConfig(dto);
        auditoriaService.registrar("UPDATE", "Configuración respaldo", "Guardado de configuración de respaldos");
        return ResponseEntity.ok(guardado);
    }

    @PostMapping("/drive-credentials")
    public ResponseEntity<BackupConfigDTO> guardarDriveCredentials(@RequestParam("file") MultipartFile file) {
        BackupConfigDTO guardado = service.guardarDriveCredentials(file);
        auditoriaService.registrar("UPDATE", "Configuración respaldo", "Carga de credenciales Drive (JSON)");
        return ResponseEntity.ok(guardado);
    }

    @GetMapping("/drive-oauth-url")
    public ResponseEntity<Map<String, String>> obtenerDriveOAuthUrl() throws Exception {
        BackupConfigDTO config = service.obtenerConfig();
        String redirectUri = "http://localhost:8080/api/backup/config/drive-oauth-callback";
        BackupConfig cfg = new BackupConfig();
        cfg.setRutaServidor(config.getRutaServidor());
        cfg.setDriveFolderId(config.getDriveFolderId());
        cfg.setDriveCredentialsPath(config.getDriveCredentialsPath());
        String url = driveStorageService.obtenerDriveOAuthUrl(cfg, redirectUri);
        return ResponseEntity.ok(Map.of(
                "url", url,
                "redirectUri", redirectUri
        ));
    }

    @GetMapping("/drive-oauth-callback")
    public ResponseEntity<String> driveOAuthCallback(@RequestParam("code") String code) throws Exception {
        BackupConfigDTO config = service.obtenerConfig();
        String redirectUri = "http://localhost:8080/api/backup/config/drive-oauth-callback";
        BackupConfig cfg = new BackupConfig();
        cfg.setRutaServidor(config.getRutaServidor());
        cfg.setDriveFolderId(config.getDriveFolderId());
        cfg.setDriveCredentialsPath(config.getDriveCredentialsPath());
        driveStorageService.guardarDriveOAuthTokens(cfg, code, redirectUri);
        return ResponseEntity.ok("Autorización Drive completada. Ya puedes volver a la pantalla de respaldos.");
    }
}