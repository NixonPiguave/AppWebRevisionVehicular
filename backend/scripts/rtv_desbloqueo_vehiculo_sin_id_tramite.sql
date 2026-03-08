-- ============================================================
-- Procedimientos desbloqueo vehículo: eliminar id_tramite
-- Motor: PostgreSQL
-- ============================================================

-- INSERT
CREATE OR REPLACE PROCEDURE public.sp_insertar_desbloqueo_vehiculo(
    p_bloqueo_id             BIGINT,
    p_vehiculo_id            BIGINT,
    p_id_entidad             BIGINT,
    p_usuario_desactiva_id   BIGINT,
    p_numero_tramite         VARCHAR(30),
    p_documento_levantamiento VARCHAR(255),
    p_motivo_levantamiento   VARCHAR(255),
    p_fecha_desactivacion    TIMESTAMP,
    p_estado                 VARCHAR(20)
)
LANGUAGE plpgsql
AS $BODY$
BEGIN
    INSERT INTO rtv_desbloqueo_vehiculo (
        bloqueo_id,
        vehiculo_id,
        id_entidad,
        usuario_desactiva_id,
        numero_tramite,
        documento_levantamiento,
        motivo_levantamiento,
        fecha_desactivacion,
        estado
    )
    VALUES (
        p_bloqueo_id,
        p_vehiculo_id,
        p_id_entidad,
        p_usuario_desactiva_id,
        p_numero_tramite,
        p_documento_levantamiento,
        p_motivo_levantamiento,
        p_fecha_desactivacion,
        p_estado
    );
END;
$BODY$;

-- UPDATE
CREATE OR REPLACE PROCEDURE public.sp_actualizar_desbloqueo_vehiculo(
    p_id_desbloqueo          BIGINT,
    p_bloqueo_id             BIGINT,
    p_vehiculo_id            BIGINT,
    p_id_entidad             BIGINT,
    p_usuario_desactiva_id   BIGINT,
    p_numero_tramite         VARCHAR(30),
    p_documento_levantamiento VARCHAR(255),
    p_motivo_levantamiento   VARCHAR(255),
    p_fecha_desactivacion    TIMESTAMP,
    p_estado                 VARCHAR(20)
)
LANGUAGE plpgsql
AS $BODY$
BEGIN
    UPDATE rtv_desbloqueo_vehiculo
    SET
        bloqueo_id             = p_bloqueo_id,
        vehiculo_id            = p_vehiculo_id,
        id_entidad             = p_id_entidad,
        usuario_desactiva_id   = p_usuario_desactiva_id,
        numero_tramite         = p_numero_tramite,
        documento_levantamiento = p_documento_levantamiento,
        motivo_levantamiento   = p_motivo_levantamiento,
        fecha_desactivacion    = p_fecha_desactivacion,
        estado                 = p_estado
    WHERE id_desbloqueo = p_id_desbloqueo;
END;
$BODY$;
