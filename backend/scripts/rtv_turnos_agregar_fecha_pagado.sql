-- Agrega columna fecha_pagado a rtv_turnos (si no existe).
-- Ejecutar en PostgreSQL una sola vez.

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

