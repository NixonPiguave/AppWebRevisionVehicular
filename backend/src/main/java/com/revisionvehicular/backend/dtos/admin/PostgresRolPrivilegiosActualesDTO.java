package com.revisionvehicular.backend.dtos.admin;

import java.util.List;

/**
 * Vista de privilegios ya otorgados: solo tablas con al menos un privilegio DML en el catálogo.
 */
public record PostgresRolPrivilegiosActualesDTO(
        String nombreRol,
        List<PostgresTablaPrivilegioDetalleDTO> detallePorTabla
) {
}
