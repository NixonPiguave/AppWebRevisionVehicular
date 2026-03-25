package com.revisionvehicular.backend.controllers.backup;

import com.revisionvehicular.backend.dtos.backup.BackupLocalFileDTO;
import com.revisionvehicular.backend.service.backup.IBackupRestoreService;
import com.revisionvehicular.backend.service.srtv.AuditoriaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/backup/restore")
public class BackupRestoreController {

    private final IBackupRestoreService restoreService;
    private final AuditoriaService auditoriaService;

    public BackupRestoreController(IBackupRestoreService restoreService,
                                    AuditoriaService auditoriaService) {
        this.restoreService = restoreService;
        this.auditoriaService = auditoriaService;
    }

    @GetMapping("/archivos-locales")
    public ResponseEntity<List<BackupLocalFileDTO>> listarArchivosLocales() {
        List<BackupLocalFileDTO> lista = restoreService.listarArchivosLocales();
        return ResponseEntity.ok(lista);
    }

    @PostMapping("/ejecutar")
    public ResponseEntity<Map<String, String>> ejecutarRestore(@RequestBody Map<String, String> body) {
        String nombreArchivo = body != null ? body.get("nombreArchivo") : null;
        restoreService.restaurar(nombreArchivo);
        auditoriaService.registrar("UPDATE", "Base de datos", "Restauración desde respaldo local: " + nombreArchivo);
        return ResponseEntity.ok(Map.of("mensaje", "Restauración completada correctamente."));
    }

    @PostMapping("/ejecutar-upload")
    public ResponseEntity<Map<String, String>> ejecutarRestoreUpload(@RequestParam("file") MultipartFile file) {
        String nombre = file != null ? file.getOriginalFilename() : null;
        restoreService.restaurarDesdeArchivoSubido(file);
        auditoriaService.registrar("UPDATE", "Base de datos", "Restauración desde archivo cargado: " + nombre);
        return ResponseEntity.ok(Map.of("mensaje", "Restauración completada correctamente desde archivo seleccionado."));
    }

    @GetMapping("/estado-bd")
    public ResponseEntity<Map<String, Object>> estadoBd() {
        return ResponseEntity.ok(restoreService.diagnosticarEstadoBaseDatos());
    }
}
