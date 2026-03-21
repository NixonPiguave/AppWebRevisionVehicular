package com.revisionvehicular.backend.controllers.backup;

import com.revisionvehicular.backend.dtos.backup.BackupRecordDTO;
import com.revisionvehicular.backend.entities.backup.BackupRecord;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import com.revisionvehicular.backend.repositories.backup.IBackupRecordRepository;
import com.revisionvehicular.backend.repositories.srtv.IUsuarioRepository;
import com.revisionvehicular.backend.service.backup.IBackupService;
import com.revisionvehicular.backend.service.srtv.AuditoriaService;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/backup")
public class BackupController {

    private final IBackupService backupService;
    private final IUsuarioRepository usuarioRepository;
    private final IBackupRecordRepository recordRepository;
    private final AuditoriaService auditoriaService;

    public BackupController(IBackupService backupService,
                            IUsuarioRepository usuarioRepository,
                            IBackupRecordRepository recordRepository,
                            AuditoriaService auditoriaService) {
        this.backupService = backupService;
        this.usuarioRepository = usuarioRepository;
        this.recordRepository = recordRepository;
        this.auditoriaService = auditoriaService;
    }

    // Ejecutar backup manual
    @PostMapping("/ejecutar")
    public ResponseEntity<BackupRecordDTO> ejecutar(@RequestParam String tipo) {
        Usuario usuario = obtenerUsuarioActual();
        BackupRecordDTO result = backupService.ejecutarBackup(tipo, "MANUAL", usuario);
        auditoriaService.registrar("INSERT", "Respaldo", "Ejecución manual tipo " + tipo + (result.getEstado() != null ? " - " + result.getEstado() : ""));
        return ResponseEntity.ok(result);
    }

    // Descargar archivo de backup al navegador
    @GetMapping("/descargar/{recordId}")
    public ResponseEntity<Resource> descargar(@PathVariable Long recordId) throws Exception {
        BackupRecord record = recordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("Backup no encontrado"));

        Path path = Paths.get(record.getRutaServidor()).toAbsolutePath().normalize();
        if (!Files.exists(path)) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new FileSystemResource(path);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + record.getNombreArchivo() + "\"")
                .contentLength(Files.size(path))
                .body(resource);
    }

    // Verificar si hay un backup en proceso actualmente
    @GetMapping("/en-proceso")
    public ResponseEntity<Boolean> hayEnProceso() {
        return ResponseEntity.ok(recordRepository.existsByEstado("EN_PROCESO"));
    }

    private Usuario obtenerUsuarioActual() {
        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return usuarioRepository.findByUsuario(username).orElse(null);
    }
}