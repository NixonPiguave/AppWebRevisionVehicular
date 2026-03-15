package com.revisionvehicular.backend.service.backup;

import com.revisionvehicular.backend.dtos.backup.BackupNotificationDTO;
import com.revisionvehicular.backend.entities.backup.BackupRecord;

import java.util.List;

public interface IBackupNotificationService {
    void crearNotificacion(BackupRecord record);
    List<BackupNotificationDTO> obtenerNoLeidas();
    List<BackupNotificationDTO> obtenerTodas();
    long contarNoLeidas();
    void marcarTodasComoLeidas();
}