package com.revisionvehicular.backend.service.backup;

import com.revisionvehicular.backend.dtos.backup.BackupConfigDTO;
import org.springframework.web.multipart.MultipartFile;

public interface IBackupConfigService {
    BackupConfigDTO obtenerConfig();
    BackupConfigDTO guardarConfig(BackupConfigDTO dto);
    BackupConfigDTO guardarDriveCredentials(MultipartFile file);
    void probarCorreo(BackupConfigDTO dto);
}