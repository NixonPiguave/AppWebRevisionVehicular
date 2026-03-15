package com.revisionvehicular.backend.controllers.backup;

import com.revisionvehicular.backend.dtos.backup.BackupNotificationDTO;
import com.revisionvehicular.backend.service.backup.IBackupNotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/backup/notificaciones")
public class BackupNotificationController {

    private final IBackupNotificationService service;

    public BackupNotificationController(IBackupNotificationService service) {
        this.service = service;
    }

    @GetMapping("/no-leidas")
    public ResponseEntity<List<BackupNotificationDTO>> obtenerNoLeidas() {
        return ResponseEntity.ok(service.obtenerNoLeidas());
    }

    @GetMapping
    public ResponseEntity<List<BackupNotificationDTO>> obtenerTodas() {
        return ResponseEntity.ok(service.obtenerTodas());
    }

    @GetMapping("/contador")
    public ResponseEntity<Long> contarNoLeidas() {
        return ResponseEntity.ok(service.contarNoLeidas());
    }

    @PutMapping("/marcar-leidas")
    public ResponseEntity<Void> marcarTodasComoLeidas() {
        service.marcarTodasComoLeidas();
        return ResponseEntity.ok().build();
    }
}