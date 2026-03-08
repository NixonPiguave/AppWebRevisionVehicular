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
BEGIN
    UPDATE rtv_turnos
    SET
        propietario_id    = p_propietario_id,
        vehiculo_id       = p_vehiculo_id,
        id_tipo_tramite   = p_id_tipo_tramite,
        id_tramite        = p_id_tramite,
        fecha_inicio      = p_fecha_inicio,
        fecha_fin         = p_fecha_fin,
        fecha_cancelado   = p_fecha_cancelado,
        estado            = p_estado
    WHERE turno_id = p_turno_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No se encontró el turno con ID %', p_turno_id;
    END IF;
END;
$$;
