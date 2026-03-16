package com.revisionvehicular.backend.entities.backup;

import com.revisionvehicular.backend.entities.srtv.Usuario;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "srtv_backup_config")
public class BackupConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "config_id")
    private Long configId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(name = "ruta_servidor", nullable = false, length = 500)
    private String rutaServidor;

    @Column(name = "drive_folder_id", length = 200)
    private String driveFolderId;

    @Column(name = "drive_credentials_path", length = 500)
    private String driveCredentialsPath;

    @Column(name = "drive_habilitado", nullable = false)
    private Boolean driveHabilitado = false;

    @Column(name = "cron_full", length = 100)
    private String cronFull;

    @Column(name = "cron_diferencial", length = 100)
    private String cronDiferencial;

    @Column(name = "cron_incremental", length = 100)
    private String cronIncremental;

    @Column(name = "scheduler_activo", nullable = false)
    private Boolean schedulerActivo = false;

    @Column(name = "email_notificacion", length = 100)
    private String emailNotificacion;

    @Column(name = "actualizado_en")
    private LocalDateTime actualizadoEn;

    @Column(name = "mail_host", length = 200)
    private String mailHost;

    @Column(name = "mail_port")
    private Integer mailPort = 587;

    @Column(name = "mail_username", length = 200)
    private String mailUsername;

    @Column(name = "mail_password", length = 300)
    private String mailPassword;

    @Column(name = "mail_from", length = 200)
    private String mailFrom;

    @Column(name = "mail_starttls")
    private Boolean mailStarttls = true;

    @Column(name = "mail_habilitado")
    private Boolean mailHabilitado = false;

    @PrePersist
    @PreUpdate
    public void actualizarFecha() {
        this.actualizadoEn = LocalDateTime.now();
    }
}