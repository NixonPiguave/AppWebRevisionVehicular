-- Corrige sp_actualizar_turno: la tabla rtv_turnos NO tiene columna id_entidad.
-- Solo se actualizan columnas existentes: propietario_id, vehiculo_id, id_tipo_tramite, id_tramite, fecha_inicio, fecha_fin, fecha_cancelado, estado.

CREATE OR REPLACE PROCEDURE public.sp_actualizar_turno(
    IN p_turno_id BIGINT,
    IN p_propietario_id BIGINT,
    IN p_vehiculo_id BIGINT,
    IN p_id_tipo_tramite BIGINT,
    IN p_id_tramite BIGINT,
    IN p_fecha_inicio DATE,
    IN p_fecha_fin DATE,
    IN p_fecha_cancelado DATE,
    IN p_estado VARCHAR(35)
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_fecha_inicio DATE;
    v_fecha_fin DATE;
    v_fecha_cancelado DATE;
    v_monto_pagado NUMERIC;
    v_validador VARCHAR(64);
BEGIN
    -- Tomar valores con defaults para que la validación/validador sea consistente
    v_fecha_inicio := COALESCE(p_fecha_inicio, CURRENT_DATE);

    -- Último día del mes para v_fecha_inicio, si fecha_fin viene null
    v_fecha_fin := COALESCE(
        p_fecha_fin,
        (date_trunc('month', v_fecha_inicio)::date + INTERVAL '1 month' - INTERVAL '1 day')::date
    );

    v_fecha_cancelado := CASE
        WHEN UPPER(p_estado) = 'CANCELADO'
            THEN COALESCE(p_fecha_cancelado, CURRENT_DATE)
        ELSE
            p_fecha_cancelado
    END;

    -- Conservar monto_pagado (si ya se pagó) para que el validador concuerde
    SELECT monto_pagado
    INTO v_monto_pagado
    FROM rtv_turnos
    WHERE turno_id = p_turno_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No se encontró el turno con ID %', p_turno_id;
    END IF;

    UPDATE rtv_turnos
    SET
        propietario_id    = p_propietario_id,
        vehiculo_id       = p_vehiculo_id,
        id_tipo_tramite   = p_id_tipo_tramite,
        id_tramite        = p_id_tramite,
        fecha_inicio      = v_fecha_inicio,
        fecha_fin         = v_fecha_fin,
        fecha_cancelado   = v_fecha_cancelado,
        estado            = p_estado
    WHERE turno_id = p_turno_id;

    IF NOT FOUND THEN
        -- Esto no debería ocurrir porque ya verificamos el SELECT FOR UPDATE
        RAISE EXCEPTION 'No se encontró el turno con ID %', p_turno_id;
    END IF;

    -- Recalcular validador encriptando todos los datos para que concuerde
    v_validador := fn_generar_validador_turno(
        p_turno_id,
        p_propietario_id,
        p_vehiculo_id,
        p_id_tipo_tramite,
        p_id_tramite,
        v_fecha_inicio,
        v_fecha_fin,
        v_fecha_cancelado,
        p_estado,
        v_monto_pagado
    );

    UPDATE rtv_turnos
    SET validador = v_validador
    WHERE turno_id = p_turno_id;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error al actualizar turno: %', SQLERRM;
END;
$$;
