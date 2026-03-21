-- Stored procedures RTV - Equipos
-- Requisitos:
--  - sp_rtv_equipos_insertar / sp_rtv_equipos_actualizar ahora reciben `p_linea_id`
--    y además insertan/actualizan la relación en `rtv_linea_equipo`.

-- PROCEDURE: public.sp_rtv_equipos_actualizar(...)
-- DROP PROCEDURE IF EXISTS public.sp_rtv_equipos_actualizar(...);
CREATE OR REPLACE PROCEDURE public.sp_rtv_equipos_actualizar(
    IN p_equipo_id bigint,
    IN p_influencia integer,
    IN p_fecha_ultima_calibracion timestamp without time zone,
    IN p_fecha_ultimo_mantenimiento timestamp without time zone,
    IN p_estado character varying,
    IN p_codigo_interno character varying,
    IN p_equipo character varying,
    IN p_modelo character varying,
    IN p_serial_equipo character varying,
    IN p_linea_id bigint
)
LANGUAGE 'plpgsql'
AS $BODY$
BEGIN
    UPDATE rtv_equipos
    SET
        influencia = p_influencia,
        fecha_ultima_calibracion = p_fecha_ultima_calibracion,
        fecha_ultimo_mantenimiento = p_fecha_ultimo_mantenimiento,
        estado = p_estado,
        codigo_interno = p_codigo_interno,
        equipo = p_equipo,
        modelo = p_modelo,
        serial_equipo = p_serial_equipo
    WHERE equipo_id = p_equipo_id;

    -- Asegurar que el equipo quede asociado a la línea indicada
    IF EXISTS (SELECT 1 FROM rtv_linea_equipo WHERE equipo_id = p_equipo_id) THEN
        UPDATE rtv_linea_equipo
        SET linea_id = p_linea_id
        WHERE equipo_id = p_equipo_id;
    ELSE
        INSERT INTO rtv_linea_equipo(linea_id, equipo_id)
        VALUES (p_linea_id, p_equipo_id);
    END IF;
END;
$BODY$;

-- PROCEDURE: public.sp_rtv_equipos_insertar(...)
-- DROP PROCEDURE IF EXISTS public.sp_rtv_equipos_insertar(...);
CREATE OR REPLACE PROCEDURE public.sp_rtv_equipos_insertar(
    IN p_influencia integer,
    IN p_fecha_ultima_calibracion timestamp without time zone,
    IN p_fecha_ultimo_mantenimiento timestamp without time zone,
    IN p_estado character varying,
    IN p_codigo_interno character varying,
    IN p_equipo character varying,
    IN p_modelo character varying,
    IN p_serial_equipo character varying,
    IN p_linea_id bigint
)
LANGUAGE 'plpgsql'
AS $BODY$
DECLARE
    v_equipo_id bigint;
BEGIN
    INSERT INTO rtv_equipos(
        influencia,
        fecha_ultima_calibracion,
        fecha_ultimo_mantenimiento,
        estado,
        codigo_interno,
        equipo,
        modelo,
        serial_equipo
    )
    VALUES (
        p_influencia,
        p_fecha_ultima_calibracion,
        p_fecha_ultimo_mantenimiento,
        p_estado,
        p_codigo_interno,
        p_equipo,
        p_modelo,
        p_serial_equipo
    )
    RETURNING equipo_id INTO v_equipo_id;

    -- Asociar el equipo insertado con la línea
    INSERT INTO rtv_linea_equipo(linea_id, equipo_id)
    VALUES (p_linea_id, v_equipo_id);
END;
$BODY$;

