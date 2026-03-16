package com.revisionvehicular.backend.controllers.backup;

import com.revisionvehicular.backend.dtos.backup.BackupRecordDTO;
import com.revisionvehicular.backend.service.backup.IBackupRecordService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/backup/historial")
public class BackupRecordController {

    private final IBackupRecordService service;

    public BackupRecordController(IBackupRecordService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<BackupRecordDTO>> obtenerHistorial() {
        return ResponseEntity.ok(service.obtenerHistorial());
    }

    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<List<BackupRecordDTO>> obtenerPorTipo(@PathVariable String tipo) {
        return ResponseEntity.ok(service.obtenerHistorialPorTipo(tipo));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BackupRecordDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.obtenerPorId(id));
    }

    @GetMapping("/en-proceso")
    public ResponseEntity<Boolean> hayEnProceso() {
        return ResponseEntity.ok(service.hayBackupEnProceso());
    }

    @PutMapping("/{id}/marcar-fallido")
    public ResponseEntity<Void> marcarComoFallido(@PathVariable Long id) {
        service.marcarComoFallido(id);
        return ResponseEntity.noContent().build();
    }
}