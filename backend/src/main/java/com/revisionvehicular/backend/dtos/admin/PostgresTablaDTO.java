package com.revisionvehicular.backend.dtos.admin;

/**
 * Tabla física listada desde information_schema (para armar GRANT).
 */
public record PostgresTablaDTO(String esquema, String nombreTabla) {
}
