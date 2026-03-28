package com.revisionvehicular.backend.dtos.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * Permisos DML deseados sobre una tabla concreta (SELECT, INSERT, UPDATE, DELETE independientes por tabla).
 */
public class TablaPermisosItemDTO {

    @NotBlank(message = "El esquema es obligatorio")
    @Pattern(regexp = "^[a-zA-Z_][a-zA-Z0-9_]{0,62}$", message = "Esquema con formato no válido")
    private String esquema;

    @NotBlank(message = "El nombre de tabla es obligatorio")
    @Pattern(regexp = "^[a-zA-Z_][a-zA-Z0-9_]{0,62}$", message = "Nombre de tabla con formato no válido")
    private String nombreTabla;

    private boolean privilegioSelect;
    private boolean privilegioInsert;
    private boolean privilegioUpdate;
    private boolean privilegioDelete;

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

    public boolean isPrivilegioSelect() {
        return privilegioSelect;
    }

    public void setPrivilegioSelect(boolean privilegioSelect) {
        this.privilegioSelect = privilegioSelect;
    }

    public boolean isPrivilegioInsert() {
        return privilegioInsert;
    }

    public void setPrivilegioInsert(boolean privilegioInsert) {
        this.privilegioInsert = privilegioInsert;
    }

    public boolean isPrivilegioUpdate() {
        return privilegioUpdate;
    }

    public void setPrivilegioUpdate(boolean privilegioUpdate) {
        this.privilegioUpdate = privilegioUpdate;
    }

    public boolean isPrivilegioDelete() {
        return privilegioDelete;
    }

    public void setPrivilegioDelete(boolean privilegioDelete) {
        this.privilegioDelete = privilegioDelete;
    }

    public boolean tieneAlgunPrivilegio() {
        return privilegioSelect || privilegioInsert || privilegioUpdate || privilegioDelete;
    }
}
