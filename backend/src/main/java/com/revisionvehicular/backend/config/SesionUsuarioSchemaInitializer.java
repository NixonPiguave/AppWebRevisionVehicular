package com.revisionvehicular.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;

/**
 * Crea la tabla srtv_sesion_usuario al arranque si no existe.
 * Usa el mismo DataSource de la aplicación, así la tabla queda en la base a la que realmente se conecta el backend
 * (útil tras un restore o si backup usa otra conexión).
 */
@Component
@Order(1)
public class SesionUsuarioSchemaInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(SesionUsuarioSchemaInitializer.class);

    private final JdbcTemplate jdbcTemplate;

    public SesionUsuarioSchemaInitializer(DataSource dataSource) {
        this.jdbcTemplate = new JdbcTemplate(dataSource);
    }

    @Override
    public void run(ApplicationArguments args) {
        try {
            jdbcTemplate.execute(
                    "CREATE TABLE IF NOT EXISTS srtv_sesion_usuario (" +
                            "sesion_id BIGSERIAL PRIMARY KEY, " +
                            "usuario_id BIGINT NOT NULL REFERENCES srtv_usuario(usuario_id) ON DELETE CASCADE, " +
                            "fecha_login TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, " +
                            "ultima_actividad TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, " +
                            "activo BOOLEAN NOT NULL DEFAULT TRUE)"
            );
            jdbcTemplate.execute(
                    "CREATE INDEX IF NOT EXISTS idx_sesion_usuario_activo ON srtv_sesion_usuario(activo) WHERE activo = TRUE"
            );
            log.info("Tabla srtv_sesion_usuario verificada/creada correctamente.");
        } catch (Exception e) {
            log.warn("No se pudo crear la tabla srtv_sesion_usuario (puede que ya exista o falte permiso): {}", e.getMessage());
        }
    }
}
