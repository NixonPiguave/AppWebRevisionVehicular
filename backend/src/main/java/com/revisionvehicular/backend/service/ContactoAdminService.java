package com.revisionvehicular.backend.service;

import com.revisionvehicular.backend.config.BusinessException;
import com.revisionvehicular.backend.dtos.ContactoAdminRequest;
import com.revisionvehicular.backend.entities.backup.BackupConfig;
import com.revisionvehicular.backend.repositories.backup.IBackupConfigRepository;
import com.revisionvehicular.backend.service.backup.BackupMailService;
import org.springframework.stereotype.Service;

@Service
public class ContactoAdminService {

    private final IBackupConfigRepository backupConfigRepository;
    private final BackupMailService backupMailService;

    public ContactoAdminService(IBackupConfigRepository backupConfigRepository,
                               BackupMailService backupMailService) {
        this.backupConfigRepository = backupConfigRepository;
        this.backupMailService = backupMailService;
    }

    public void enviarSolicitud(ContactoAdminRequest request) {
        BackupConfig config = backupConfigRepository.findTopByOrderByConfigIdDesc()
                .orElseThrow(() -> new BusinessException("No hay configuración de correo. El administrador debe configurar SMTP en Respaldos."));

        if (!Boolean.TRUE.equals(config.getMailHabilitado())) {
            throw new BusinessException("El correo no está habilitado. Contacte al administrador por otro medio.");
        }
        if (config.getEmailNotificacion() == null || config.getEmailNotificacion().isBlank()) {
            throw new BusinessException("No hay correo de destino configurado.");
        }

        backupMailService.enviarContactoAdmin(request, config);
    }
}
