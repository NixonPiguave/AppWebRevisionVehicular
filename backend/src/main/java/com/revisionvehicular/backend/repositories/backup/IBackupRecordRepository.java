package com.revisionvehicular.backend.repositories.backup;

import com.revisionvehicular.backend.entities.backup.BackupRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface IBackupRecordRepository extends JpaRepository<BackupRecord, Long> {

    List<BackupRecord> findAllByOrderByCreadoEnDesc();

    List<BackupRecord> findByTipoOrderByCreadoEnDesc(String tipo);

    // Para respaldo diferencial e incremental necesitamos el último FULL exitoso
    Optional<BackupRecord> findTopByTipoAndEstadoOrderByCreadoEnDesc(String tipo, String estado);

    // Para verificar si hay un backup en proceso actualmente
    boolean existsByEstado(String estado);

    /** Registros en estado dado creados antes de la fecha (para marcar EN_PROCESO obsoletos). */
    List<BackupRecord> findByEstadoAndCreadoEnBefore(String estado, LocalDateTime creadoAntesDe);

    /** Para marcar como EXITOSO al restaurar un archivo que tenía registro EN_PROCESO. */
    List<BackupRecord> findByNombreArchivoAndEstado(String nombreArchivo, String estado);
}