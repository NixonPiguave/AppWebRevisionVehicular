package com.revisionvehicular.backend.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ContactoAdminRequest {

    @NotBlank(message = "El usuario es requerido")
    @Size(max = 100)
    private String usuario;

    @Size(max = 500)
    private String mensaje;

    /** Motivo del contacto (ej: cuenta_inactiva, sin_rol_activo, credenciales_invalidas) */
    @Size(max = 50)
    private String motivo;
}
