package com.revisionvehicular.backend.service.backup;

import com.revisionvehicular.backend.dtos.backup.BackupLocalFileDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface IBackupRestoreService {

    /** Lista archivos .backup en la carpeta local configurada (respaldos restaurables con pg_restore). */
    List<BackupLocalFileDTO> listarArchivosLocales();

    /** Restaura la base de datos desde un archivo .backup local. Operación destructiva. */
    void restaurar(String nombreArchivo);

    /** Restaura la base de datos desde un archivo .backup subido por el cliente. */
    void restaurarDesdeArchivoSubido(MultipartFile archivo);

    /** Indica si la BD parece incompleta y conviene ejecutar restauración. */
    Map<String, Object> diagnosticarEstadoBaseDatos();
}
