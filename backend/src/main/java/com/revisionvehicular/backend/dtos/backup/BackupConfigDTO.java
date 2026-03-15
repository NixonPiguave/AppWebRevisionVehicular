package com.revisionvehicular.backend.dtos.backup;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BackupConfigDTO {

    private Long configId;
    private String rutaServidor;
    private String driveFolderId;
    private String driveCredentialsPath;
    private Boolean driveHabilitado;
    private String cronFull;
    private String cronDiferencial;
    private String cronIncremental;
    private Boolean schedulerActivo;
    private String emailNotificacion;
    private Long usuarioId;
    private String nombreUsuario;
}