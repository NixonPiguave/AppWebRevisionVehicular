package com.revisionvehicular.backend.controllers.backup;

import com.revisionvehicular.backend.dtos.backup.BackupConfigDTO;
import com.revisionvehicular.backend.service.backup.IBackupConfigService;
import com.revisionvehicular.backend.service.srtv.AuditoriaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/backup/config")
public class BackupConfigController {

    private final IBackupConfigService service;
    private final AuditoriaService auditoriaService;

    public BackupConfigController(IBackupConfigService service,
                                  AuditoriaService auditoriaService) {
        this.service = service;
        this.auditoriaService = auditoriaService;
    }

    @PostMapping("/config/probar-correo")
    public ResponseEntity<Void> probarCorreo(@RequestBody BackupConfigDTO dto) {
        service.probarCorreo(dto);
        auditoriaService.registrar("UPDATE", "Configuración respaldo", "Prueba de correo de notificaciones");
        return ResponseEntity.ok().build();
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
}