package com.revisionvehicular.backend.service.backup;

import com.revisionvehicular.backend.dtos.backup.BackupRecordDTO;
import java.util.List;

public interface IBackupRecordService {
    List<BackupRecordDTO> obtenerHistorial();
    List<BackupRecordDTO> obtenerHistorialPorTipo(String tipo);
    BackupRecordDTO obtenerPorId(Long id);
    boolean hayBackupEnProceso();
    /** Marca un registro EN_PROCESO como FALLIDO (para desbloquear respaldos colgados). */
    void marcarComoFallido(Long recordId);

    /** Tras un incremental exitoso: conserva un solo registro por el archivo rotativo. */
    void eliminarHistorialIncrementalDuplicado(Long recordIdConservar, String nombreArchivoRotativo);
}