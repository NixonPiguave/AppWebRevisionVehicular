-- Tabla de sesiones de usuario (para sesiones activas y desconectar).
-- Si usa JPA con ddl-auto=update puede no ser necesario. PostgreSQL.

CREATE TABLE IF NOT EXISTS srtv_sesion_usuario (
    sesion_id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES srtv_usuario(usuario_id) ON DELETE CASCADE,
    fecha_login TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ultima_actividad TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_sesion_usuario_activo ON srtv_sesion_usuario(activo) WHERE activo = TRUE;
