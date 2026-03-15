package com.revisionvehicular.backend.entities.backup;

import com.revisionvehicular.backend.entities.srtv.Usuario;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "srtv_backup_record")
public class BackupRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "record_id")
    private Long recordId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(name = "nombre_archivo", nullable = true, length = 300)
    private String nombreArchivo;

    @Column(name = "tipo", nullable = false, length = 20)
    private String tipo; // FULL, DIFFERENTIAL, INCREMENTAL

    @Column(name = "origen", nullable = false, length = 20)
    private String origen; // MANUAL, AUTOMATICO

    @Column(name = "ruta_servidor", length = 500)
    private String rutaServidor;

    @Column(name = "drive_file_id", length = 200)
    private String driveFileId;

    @Column(name = "tamano_bytes")
    private Long tamanoBytes;

    @Column(name = "estado", nullable = false, length = 20)
    private String estado; // EXITOSO, FALLIDO, EN_PROCESO

    @Column(name = "mensaje_error", length = 1000)
    private String mensajeError;

    @Column(name = "creado_en", nullable = false)
    private LocalDateTime creadoEn;

    @Column(name = "finalizado_en")
    private LocalDateTime finalizadoEn;

    @Column(name = "ejecutado_por", length = 100)
    private String ejecutadoPor; // usuario que lo solicitó o "SCHEDULER"

    @PrePersist
    public void asignarFecha() {
        this.creadoEn = LocalDateTime.now();
    }
}