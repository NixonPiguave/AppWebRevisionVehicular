-- Migración completa para:
-- 1) Agregar columna rtv_turnos.fecha_pagado
-- 2) Actualizar procedure sp_actualizar_monto_pagado para setear fecha_pagado al registrar el pago
-- Ejecutar en PostgreSQL (una sola vez).

-- 1) Columna
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'rtv_turnos'
          AND column_name = 'fecha_pagado'
    ) THEN
        ALTER TABLE rtv_turnos
            ADD COLUMN fecha_pagado DATE;
    END IF;
END
$$;

-- 2) Procedure
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

