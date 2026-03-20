package com.revisionvehicular.backend.service.backup;

import com.revisionvehicular.backend.dtos.backup.BackupRecordDTO;
import com.revisionvehicular.backend.entities.srtv.Usuario;

public interface IBackupService {
    BackupRecordDTO ejecutarBackup(String tipo, String origen, Usuario usuario);

    /** Nombre de archivo fijo que cada incremental sobrescribe (según application.properties). */
    String getNombreArchivoIncrementalRolling();
}