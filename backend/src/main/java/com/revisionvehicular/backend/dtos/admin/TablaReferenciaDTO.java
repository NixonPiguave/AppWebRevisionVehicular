package com.revisionvehicular.backend.dtos.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class TablaReferenciaDTO {

    @NotBlank(message = "El esquema es obligatorio")
    @Pattern(regexp = "^[a-zA-Z_][a-zA-Z0-9_]{0,62}$", message = "Esquema con formato no válido")
    private String esquema;

    @NotBlank(message = "El nombre de tabla es obligatorio")
    @Pattern(regexp = "^[a-zA-Z_][a-zA-Z0-9_]{0,62}$", message = "Nombre de tabla con formato no válido")
    private String nombreTabla;

    public String getEsquema() {
        return esquema;
    }

    public void setEsquema(String esquema) {
        this.esquema = esquema;
    }

    public String getNombreTabla() {
        return nombreTabla;
    }

    public void setNombreTabla(String nombreTabla) {
        this.nombreTabla = nombreTabla;
    }
}
