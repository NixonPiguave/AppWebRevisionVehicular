-- Procedimientos almacenados para Baja de Vehículo (rtv_baja_vehiculo).
-- Servicio 12 — Art.62 · Art.63 · Art.64 · Art.65
-- Ejecutar en PostgreSQL.

-- ========== sp_insertar_baja_vehiculo ==========
CREATE OR REPLACE PROCEDURE public.sp_insertar_baja_vehiculo(
    IN p_id_tramite BIGINT,
    IN p_vehiculo_id BIGINT,
    IN p_propietario_id BIGINT,
    IN p_id_entidad BIGINT,
    IN p_usuario_id BIGINT,
    IN p_numero_tramite VARCHAR(30),
    IN p_motivo_baja VARCHAR(30),
    IN p_descripcion_motivo VARCHAR(500),
    IN p_inspeccion_1_id BIGINT,
    IN p_inspeccion_2_id BIGINT,
    IN p_inspeccion_3_id BIGINT,
    IN p_empresa_chatarrizado VARCHAR(100),
    IN p_cert_chatarrizado VARCHAR(255),
    IN p_fecha_chatarrizado DATE,
    IN p_orden_judicial VARCHAR(255),
    IN p_constancia_policial VARCHAR(255),
    IN p_notificado_sri VARCHAR(3),
    IN p_fecha_notificacion_sri DATE,
    IN p_estado VARCHAR(20),
    IN p_fecha_solicitud TIMESTAMP,
    IN p_fecha_conclusion TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO rtv_baja_vehiculo (
        id_tramite,
        vehiculo_id,
        propietario_id,
        id_entidad,
        usuario_id,
        numero_tramite,
        motivo_baja,
        descripcion_motivo,
        inspeccion_1_id,
        inspeccion_2_id,
        inspeccion_3_id,
        empresa_chatarrizado,
        cert_chatarrizado,
        fecha_chatarrizado,
        orden_judicial,
        constancia_policial,
        notificado_sri,
        fecha_notificacion_sri,
        estado,
        fecha_solicitud,
        fecha_conclusion
    ) VALUES (
        p_id_tramite,
        p_vehiculo_id,
        p_propietario_id,
        p_id_entidad,
        p_usuario_id,
        p_numero_tramite,
        p_motivo_baja,
        p_descripcion_motivo,
        p_inspeccion_1_id,
        p_inspeccion_2_id,
        p_inspeccion_3_id,
        NULLIF(TRIM(p_empresa_chatarrizado), ''),
        NULLIF(TRIM(p_cert_chatarrizado), ''),
        p_fecha_chatarrizado,
        NULLIF(TRIM(p_orden_judicial), ''),
        NULLIF(TRIM(p_constancia_policial), ''),
        p_notificado_sri,
        p_fecha_notificacion_sri,
        p_estado,
        p_fecha_solicitud,
        p_fecha_conclusion
    );
END;
$$;

-- ========== sp_actualizar_baja_vehiculo ==========
CREATE OR REPLACE PROCEDURE public.sp_actualizar_baja_vehiculo(
    IN p_id_baja BIGINT,
    IN p_id_tramite BIGINT,
    IN p_vehiculo_id BIGINT,
    IN p_propietario_id BIGINT,
    IN p_id_entidad BIGINT,
    IN p_usuario_id BIGINT,
    IN p_numero_tramite VARCHAR(30),
    IN p_motivo_baja VARCHAR(30),
    IN p_descripcion_motivo VARCHAR(500),
    IN p_inspeccion_1_id BIGINT,
    IN p_inspeccion_2_id BIGINT,
    IN p_inspeccion_3_id BIGINT,
    IN p_empresa_chatarrizado VARCHAR(100),
    IN p_cert_chatarrizado VARCHAR(255),
    IN p_fecha_chatarrizado DATE,
    IN p_orden_judicial VARCHAR(255),
    IN p_constancia_policial VARCHAR(255),
    IN p_notificado_sri VARCHAR(3),
    IN p_fecha_notificacion_sri DATE,
    IN p_estado VARCHAR(20),
    IN p_fecha_solicitud TIMESTAMP,
    IN p_fecha_conclusion TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE rtv_baja_vehiculo
    SET
        id_tramite             = p_id_tramite,
        vehiculo_id             = p_vehiculo_id,
        propietario_id          = p_propietario_id,
        id_entidad              = p_id_entidad,
        usuario_id              = p_usuario_id,
        numero_tramite          = p_numero_tramite,
        motivo_baja             = p_motivo_baja,
        descripcion_motivo      = p_descripcion_motivo,
        inspeccion_1_id         = p_inspeccion_1_id,
        inspeccion_2_id         = p_inspeccion_2_id,
        inspeccion_3_id         = p_inspeccion_3_id,
        empresa_chatarrizado    = NULLIF(TRIM(p_empresa_chatarrizado), ''),
        cert_chatarrizado       = NULLIF(TRIM(p_cert_chatarrizado), ''),
        fecha_chatarrizado      = p_fecha_chatarrizado,
        orden_judicial          = NULLIF(TRIM(p_orden_judicial), ''),
        constancia_policial     = NULLIF(TRIM(p_constancia_policial), ''),
        notificado_sri          = p_notificado_sri,
        fecha_notificacion_sri  = p_fecha_notificacion_sri,
        estado                  = p_estado,
        fecha_solicitud         = p_fecha_solicitud,
        fecha_conclusion        = p_fecha_conclusion
    WHERE id_baja = p_id_baja;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No se encontró la baja de vehículo con id_baja %', p_id_baja;
    END IF;
END;
$$;

-- Opcional: asignar propietario del procedimiento
-- ALTER PROCEDURE public.sp_insertar_baja_vehiculo(...) OWNER TO postgres;
-- ALTER PROCEDURE public.sp_actualizar_baja_vehiculo(...) OWNER TO postgres;
