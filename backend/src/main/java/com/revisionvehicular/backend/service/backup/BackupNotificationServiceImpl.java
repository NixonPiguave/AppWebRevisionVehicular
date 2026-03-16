// service/backup/BackupNotificationServiceImpl.java
package com.revisionvehicular.backend.service.backup;

import com.revisionvehicular.backend.dtos.backup.BackupNotificationDTO;
import com.revisionvehicular.backend.entities.backup.BackupNotification;
import com.revisionvehicular.backend.entities.backup.BackupRecord;
import com.revisionvehicular.backend.repositories.backup.IBackupConfigRepository;
import com.revisionvehicular.backend.repositories.backup.IBackupNotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BackupNotificationServiceImpl implements IBackupNotificationService {

    private final IBackupNotificationRepository repository;
    private final BackupMailService mailService;
    private final IBackupConfigRepository configRepository;

    public BackupNotificationServiceImpl(IBackupNotificationRepository repository, BackupMailService mailService, IBackupConfigRepository configRepository) {
        this.repository = repository;
        this.mailService = mailService;
        this.configRepository = configRepository;
    }

    @Override
    public void crearNotificacion(BackupRecord record) {
        BackupNotification notif = new BackupNotification();
        notif.setBackupRecord(record);
        notif.setUsuario(record.getUsuario());

        boolean exitoso = "EXITOSO".equals(record.getEstado());
        notif.setTipo(exitoso ? "EXITO" : "ERROR");
        notif.setTitulo(exitoso
                ? "Respaldo completado: " + record.getTipo()
                : "Respaldo fallido: " + record.getTipo());
        notif.setMensaje(exitoso
                ? "El respaldo " + record.getNombreArchivo() + " se completó correctamente."
                : "Error al ejecutar el respaldo: " + record.getMensajeError());
        notif.setLeida(false);
        repository.save(notif);

        configRepository.findTopByOrderByConfigIdAsc().ifPresent(config -> {
            mailService.enviarNotificacion(record, config);
        });
    }

    @Override
    public List<BackupNotificationDTO> obtenerNoLeidas() {
        return repository.findByLeidaFalseOrderByCreadoEnDesc()
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<BackupNotificationDTO> obtenerTodas() {
        return repository.findAllByOrderByCreadoEnDesc()
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public long contarNoLeidas() {
        return repository.countByLeidaFalse();
    }

    @Override
    public void marcarTodasComoLeidas() {
        repository.marcarTodasComoLeidas();
    }

    private BackupNotificationDTO toDTO(BackupNotification n) {
        BackupNotificationDTO dto = new BackupNotificationDTO();
        dto.setNotificationId(n.getNotificationId());
        dto.setRecordId(n.getBackupRecord().getRecordId());
        if (n.getUsuario() != null) {
            dto.setUsuarioId(n.getUsuario().getUsuarioId());
            dto.setNombreUsuario(n.getUsuario().getNombre() + " " + n.getUsuario().getApellido());
        }
        dto.setTitulo(n.getTitulo());
        dto.setMensaje(n.getMensaje());
        dto.setTipo(n.getTipo());
        dto.setLeida(n.getLeida());
        dto.setCreadoEn(n.getCreadoEn());
        return dto;
    }
}