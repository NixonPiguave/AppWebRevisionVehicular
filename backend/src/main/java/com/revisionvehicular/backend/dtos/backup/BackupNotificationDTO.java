package com.revisionvehicular.backend.dtos.backup;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BackupNotificationDTO {

    private Long notificationId;
    private Long recordId;
    private Long usuarioId;
    private String nombreUsuario;
    private String titulo;
    private String mensaje;
    private String tipo;
    private Boolean leida;
    private LocalDateTime creadoEn;
}