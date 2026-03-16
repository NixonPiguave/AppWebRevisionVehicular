package com.revisionvehicular.backend.service.backup;

import com.revisionvehicular.backend.dtos.backup.BackupLocalFileDTO;

import java.util.List;

public interface IBackupRestoreService {

    /** Lista archivos .backup en la carpeta local configurada (respaldos restaurables con pg_restore). */
    List<BackupLocalFileDTO> listarArchivosLocales();

    /** Restaura la base de datos desde un archivo .backup local. Operación destructiva. */
    void restaurar(String nombreArchivo);
}
