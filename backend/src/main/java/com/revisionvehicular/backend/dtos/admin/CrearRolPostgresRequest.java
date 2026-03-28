package com.revisionvehicular.backend.dtos.admin;

import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class CrearRolPostgresRequest {

    @NotBlank(message = "El nombre del rol es obligatorio")
    @Pattern(regexp = "^rol_[a-z0-9_]{1,59}$", message = "Debe empezar por rol_ y usar solo minúsculas, números y guion bajo (máx. 63 caracteres)")
    private String nombreRol;

    /** Solo tablas con al menos un privilegio true; permisos pueden diferir entre tablas. */
    @NotNull(message = "Debe enviar la lista de permisos por tabla")
    @Valid
    private List<TablaPermisosItemDTO> permisosPorTabla;

    @AssertTrue(message = "Debe otorgar al menos un privilegio en alguna tabla")
    public boolean isAlMenosUnPrivilegioEnAlgunaTabla() {
        if (permisosPorTabla == null || permisosPorTabla.isEmpty()) {
            return false;
        }
        return permisosPorTabla.stream().anyMatch(TablaPermisosItemDTO::tieneAlgunPrivilegio);
    }

    @AssertTrue(message = "No repita la misma tabla (esquema + nombre)")
    public boolean isSinTablasDuplicadas() {
        if (permisosPorTabla == null || permisosPorTabla.isEmpty()) {
            return true;
        }
        Set<String> claves = new HashSet<>();
        for (TablaPermisosItemDTO i : permisosPorTabla) {
            String k = i.getEsquema() + "." + i.getNombreTabla();
            if (!claves.add(k)) {
                return false;
            }
        }
        return true;
    }

    public String getNombreRol() {
        return nombreRol;
    }

    public void setNombreRol(String nombreRol) {
        this.nombreRol = nombreRol;
    }

    public List<TablaPermisosItemDTO> getPermisosPorTabla() {
        return permisosPorTabla;
    }

    public void setPermisosPorTabla(List<TablaPermisosItemDTO> permisosPorTabla) {
        this.permisosPorTabla = permisosPorTabla;
    }
}
