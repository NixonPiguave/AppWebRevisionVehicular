-- sp_actualizar_monto_pagado: actualiza monto_pagado, validador y estado = 'PAGADO' solo para el turno indicado.
-- Ejecuta este script en tu base PostgreSQL para que al registrar el pago el estado pase a PAGADO.

CREATE OR REPLACE PROCEDURE public.sp_actualizar_monto_pagado(
    IN p_turno_id BIGINT,
    IN p_monto_pagado NUMERIC
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_turno     rtv_turnos%ROWTYPE;
    v_validador VARCHAR(64);
BEGIN
    SELECT * INTO v_turno
    FROM rtv_turnos
    WHERE turno_id = p_turno_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No se encontró el turno con ID %', p_turno_id;
    END IF;

    IF v_turno.monto_pagado IS NOT NULL THEN
        RAISE EXCEPTION 'El turno % ya tiene un pago registrado de %', p_turno_id, v_turno.monto_pagado;
    END IF;

    v_validador := fn_generar_validador_turno(
        v_turno.turno_id,
        v_turno.propietario_id,
        v_turno.vehiculo_id,
        v_turno.id_tipo_tramite,
        v_turno.id_tramite,
        v_turno.fecha_inicio,
        v_turno.fecha_fin,
        v_turno.fecha_cancelado,
        'PAGADO',
        p_monto_pagado
    );

    UPDATE rtv_turnos
    SET monto_pagado = p_monto_pagado,
        validador    = v_validador,
        estado       = 'PAGADO',
        fecha_pagado = CURRENT_DATE
    WHERE turno_id = p_turno_id;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error al registrar pago del turno %: %', p_turno_id, SQLERRM;
END;
$$;

ALTER PROCEDURE public.sp_actualizar_monto_pagado(bigint, numeric) OWNER TO postgres;
