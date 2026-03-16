package com.revisionvehicular.backend.dtos.backup;

import lombok.Data;

import java.time.Instant;

@Data
public class BackupLocalFileDTO {
    private String nombreArchivo;
    private Long tamanoBytes;
    private String tamanoFormateado;
    private Instant fechaModificacion;
}
