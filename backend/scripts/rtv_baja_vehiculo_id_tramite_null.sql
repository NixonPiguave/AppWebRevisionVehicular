-- ============================================================
-- Baja de vehículo: permitir id_tramite NULL y procedimiento
-- Ejecutar en la MISMA base de datos que usa la aplicación.
-- ============================================================

-- 1) Permitir NULL en id_tramite (obligatorio)
ALTER TABLE public.rtv_baja_vehiculo
  ALTER COLUMN id_tramite DROP NOT NULL;

-- 2) Procedimiento que inserta sin id_tramite cuando es NULL (evita error si la columna aún no aceptaba NULL)
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
    IF p_id_tramite IS NULL THEN
        INSERT INTO rtv_baja_vehiculo (
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
    ELSE
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
    END IF;
END;
$$;
