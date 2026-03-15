package com.revisionvehicular.backend.service.backup;

import com.revisionvehicular.backend.dtos.backup.BackupRecordDTO;
import java.util.List;

public interface IBackupRecordService {
    List<BackupRecordDTO> obtenerHistorial();
    List<BackupRecordDTO> obtenerHistorialPorTipo(String tipo);
    BackupRecordDTO obtenerPorId(Long id);
    boolean hayBackupEnProceso();
}