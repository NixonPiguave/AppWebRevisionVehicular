package com.revisionvehicular.backend.entities.backup;

import com.revisionvehicular.backend.entities.srtv.Usuario;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "srtv_backup_notification")
public class BackupNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id")
    private Long notificationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "record_id", nullable = false)
    private BackupRecord backupRecord;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(name = "titulo", nullable = false, length = 200)
    private String titulo;

    @Column(name = "mensaje", nullable = false, length = 1000)
    private String mensaje;

    @Column(name = "tipo", nullable = false, length = 20)
    private String tipo; // EXITO, ERROR

    @Column(name = "leida", nullable = false)
    private Boolean leida = false;

    @Column(name = "creado_en", nullable = false)
    private LocalDateTime creadoEn;

    @PrePersist
    public void asignarFecha() {
        this.creadoEn = LocalDateTime.now();
    }
}