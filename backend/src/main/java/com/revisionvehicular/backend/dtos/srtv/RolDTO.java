package com.revisionvehicular.backend.dtos.srtv;
import lombok.Data;

import java.util.List;

@Data
public class RolDTO {
    private Long rolId;
    private String nombre;
    private String estado;
    private String permisosJson;
    private List<Long> permisoIds;
    /** IDs de opciones de menú (tabla srtv_rol_opcion_menu) para visibilidad en el menú. No confundir con permisoIds (srtv_permiso). */
    private List<Long> opcionMenuIds;
}
