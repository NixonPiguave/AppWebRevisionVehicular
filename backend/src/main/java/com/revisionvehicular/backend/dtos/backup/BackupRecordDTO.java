package com.revisionvehicular.backend.dtos.backup;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BackupRecordDTO {

    private Long recordId;
    private String nombreArchivo;
    private String tipo;
    private String origen;
    private String rutaServidor;
    private String driveFileId;
    private Long tamanoBytes;
    private String estado;
    private String mensajeError;
    private LocalDateTime creadoEn;
    private LocalDateTime finalizadoEn;
    private String ejecutadoPor;
    private String tamanoFormateado; // campo calculado: "24.5 MB"
    private Long usuarioId;
    private String nombreUsuario;
}