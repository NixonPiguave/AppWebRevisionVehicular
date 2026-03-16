package com.revisionvehicular.backend.controllers.backup;

import com.revisionvehicular.backend.dtos.backup.BackupConfigDTO;
import com.revisionvehicular.backend.service.backup.IBackupConfigService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/backup/config")
public class BackupConfigController {

    private final IBackupConfigService service;

    public BackupConfigController(IBackupConfigService service) {
        this.service = service;
    }

    @PostMapping("/config/probar-correo")
    public ResponseEntity<Void> probarCorreo(@RequestBody BackupConfigDTO dto) {
        service.probarCorreo(dto);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<BackupConfigDTO> obtener() {
        return ResponseEntity.ok(service.obtenerConfig());
    }

    @PostMapping
    public ResponseEntity<BackupConfigDTO> guardar(@RequestBody BackupConfigDTO dto) {
        return ResponseEntity.ok(service.guardarConfig(dto));
    }

}