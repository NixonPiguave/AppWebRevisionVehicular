package com.revisionvehicular.backend.service.backup;

import com.revisionvehicular.backend.dtos.backup.BackupConfigDTO;

public interface IBackupConfigService {
    BackupConfigDTO obtenerConfig();
    BackupConfigDTO guardarConfig(BackupConfigDTO dto);
}