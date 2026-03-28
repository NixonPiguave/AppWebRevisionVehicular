package com.revisionvehicular.backend.dtos.admin;

import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Sincroniza privilegios por tabla. Lista vacía = solo revocar en catálogo (sin nuevos GRANT).
 */
public class SincronizarPrivilegiosPostgresRequest {

    @NotBlank(message = "El nombre del rol es obligatorio")
    @Pattern(regexp = "^[a-zA-Z_][a-zA-Z0-9_]{0,62}$", message = "Nombre de rol no válido para PostgreSQL")
    private String nombreRol;

    @NotNull(message = "Debe enviar la lista de permisos por tabla (puede estar vacía para quitar todos)")
    @Valid
    private List<TablaPermisosItemDTO> permisosPorTabla;

    @AssertTrue(message = "El nombre debe comenzar por rol_ (cualquier mayúscula/minúscula)")
    public boolean isPrefijoRolUnderscore() {
        return nombreRol != null && nombreRol.regionMatches(true, 0, "rol_", 0, 4);
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
