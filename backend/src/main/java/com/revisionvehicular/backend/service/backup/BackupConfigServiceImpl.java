package com.revisionvehicular.backend.service.backup;

import com.revisionvehicular.backend.dtos.backup.BackupConfigDTO;
import com.revisionvehicular.backend.entities.backup.BackupConfig;
import com.revisionvehicular.backend.entities.backup.BackupRecord;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import com.revisionvehicular.backend.repositories.backup.IBackupConfigRepository;
import com.revisionvehicular.backend.repositories.srtv.IUsuarioRepository;

import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class BackupConfigServiceImpl implements IBackupConfigService {

    private final IBackupConfigRepository repository;
    private final IUsuarioRepository usuarioRepository;
    private final BackupSchedulerService schedulerService;
    private final BackupMailService mailService;
    private final CryptoService cryptoService;

    public BackupConfigServiceImpl(IBackupConfigRepository repository,
                                   IUsuarioRepository usuarioRepository,
                                   BackupSchedulerService schedulerService,
                                   BackupMailService mailService,
                                   CryptoService cryptoService) {
        this.repository = repository;
        this.usuarioRepository = usuarioRepository;
        this.schedulerService = schedulerService;
        this.mailService = mailService;
        this.cryptoService = cryptoService;
    }

    @Override
    public BackupConfigDTO obtenerConfig() {
        return repository.findTopByOrderByConfigIdAsc()
                .map(this::toDTO)
                .orElse(new BackupConfigDTO());
    }

    @Override
    public BackupConfigDTO guardarConfig(BackupConfigDTO dto) {
        // Validar que la ruta del servidor exista o pueda crearse
        validarRutaServidor(dto.getRutaServidor());

        BackupConfig config = repository.findTopByOrderByConfigIdAsc()
                .orElse(new BackupConfig());

        config.setRutaServidor(dto.getRutaServidor());
        config.setDriveFolderId(dto.getDriveFolderId());
        config.setDriveCredentialsPath(dto.getDriveCredentialsPath());
        config.setDriveHabilitado(dto.getDriveHabilitado() != null && dto.getDriveHabilitado());
        config.setCronFull(dto.getCronFull());
        config.setCronDiferencial(dto.getCronDiferencial());
        config.setCronIncremental(dto.getCronIncremental());
        config.setSchedulerActivo(dto.getSchedulerActivo() != null && dto.getSchedulerActivo());
        config.setEmailNotificacion(dto.getEmailNotificacion());
        config.setMailHabilitado(dto.getMailHabilitado() != null && dto.getMailHabilitado());
        config.setMailUsername(dto.getMailUsername());
        config.setMailFrom(dto.getMailFrom());
        if (dto.getMailPassword() != null && !dto.getMailPassword().isBlank()) {
            String pass = dto.getMailPassword();
            config.setMailPassword(pass.startsWith("v1:") ? pass : cryptoService.encrypt(pass));
        }
        if (dto.getUsuarioId() != null) {
            Usuario usuario = usuarioRepository.findById(dto.getUsuarioId())
                    .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con id: " + dto.getUsuarioId()));
            config.setUsuario(usuario);
        } else {
            config.setUsuario(null);
        }

        BackupConfig configGuardada = repository.save(config);
        try {
            schedulerService.actualizarSchedules(configGuardada);
        } catch (Exception e) {
            // No fallar el guardado si el scheduler tiene un problema
            System.err.println("Error al actualizar scheduler: " + e.getMessage());
        }
        return toDTO(configGuardada);
    }

    private void validarRutaServidor(String ruta) {
        if (ruta == null || ruta.isBlank()) {
            throw new RuntimeException("La ruta del servidor no puede estar vacía");
        }
        try {
            Path path = Paths.get(ruta);
            if (!Files.exists(path)) {
                Files.createDirectories(path);
            }
            if (!Files.isWritable(path)) {
                throw new RuntimeException("La ruta no tiene permisos de escritura: " + ruta);
            }
        } catch (Exception e) {
            throw new RuntimeException("Ruta inválida: " + e.getMessage());
        }
    }

    @Override
    public void probarCorreo(BackupConfigDTO dto) {
        BackupConfig configTemporal = new BackupConfig();
        configTemporal.setEmailNotificacion(dto.getEmailNotificacion());
        configTemporal.setMailHabilitado(true);
        configTemporal.setMailUsername(dto.getMailUsername());
        configTemporal.setMailFrom(dto.getMailFrom());
        configTemporal.setMailPassword(dto.getMailPassword() != null && !dto.getMailPassword().isBlank()
                ? (dto.getMailPassword().startsWith("v1:") ? dto.getMailPassword() : cryptoService.encrypt(dto.getMailPassword()))
                : null);

        // Crear un record de prueba ficticio
        BackupRecord recordPrueba = new BackupRecord();
        recordPrueba.setTipo("PRUEBA");
        recordPrueba.setOrigen("MANUAL");
        recordPrueba.setEstado("EXITOSO");
        recordPrueba.setEjecutadoPor("Sistema");
        recordPrueba.setNombreArchivo("correo_de_prueba.txt");
        recordPrueba.setCreadoEn(java.time.LocalDateTime.now());
        recordPrueba.setFinalizadoEn(java.time.LocalDateTime.now());

        try {
            mailService.enviarNotificacion(recordPrueba, configTemporal);
        } catch (Exception e) {
            throw new RuntimeException("Error al enviar correo de prueba: " + e.getMessage());
        }
    }

    private BackupConfigDTO toDTO(BackupConfig config) {
        BackupConfigDTO dto = new BackupConfigDTO();
        dto.setConfigId(config.getConfigId());
        dto.setRutaServidor(config.getRutaServidor());
        dto.setDriveFolderId(config.getDriveFolderId());
        dto.setDriveCredentialsPath(config.getDriveCredentialsPath());
        dto.setDriveHabilitado(config.getDriveHabilitado());
        dto.setCronFull(config.getCronFull());
        dto.setCronDiferencial(config.getCronDiferencial());
        dto.setCronIncremental(config.getCronIncremental());
        dto.setSchedulerActivo(config.getSchedulerActivo());
        dto.setEmailNotificacion(config.getEmailNotificacion());
        dto.setMailUsername(config.getMailUsername());
        dto.setMailFrom(config.getMailFrom());
        dto.setMailHabilitado(config.getMailHabilitado());
        if (config.getUsuario() != null) {
            dto.setUsuarioId(config.getUsuario().getUsuarioId());
            dto.setNombreUsuario(config.getUsuario().getNombre() + " " + config.getUsuario().getApellido());
        }
        return dto;
    }

}