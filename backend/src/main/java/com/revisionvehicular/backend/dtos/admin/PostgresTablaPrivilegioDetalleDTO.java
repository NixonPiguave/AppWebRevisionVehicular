package com.revisionvehicular.backend.dtos.admin;

/**
 * Privilegios DML actuales de un rol sobre una tabla (según {@code information_schema.role_table_grants}).
 */
public record PostgresTablaPrivilegioDetalleDTO(
        String esquema,
        String nombreTabla,
        boolean privilegioSelect,
        boolean privilegioInsert,
        boolean privilegioUpdate,
        boolean privilegioDelete
) {
}
