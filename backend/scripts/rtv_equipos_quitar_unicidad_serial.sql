-- Quita cualquier restricción/índice UNIQUE que exista en rtv_equipos.serial_equipo.
-- Esto es necesario porque cambiar el `unique=true` en el entity no modifica automáticamente la BD.
DO $$
DECLARE
    r RECORD;
BEGIN
    -- UNIQUE constraints
    FOR r IN
        SELECT c.conname
        FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        JOIN pg_attribute a ON a.attrelid = t.oid
        WHERE c.contype = 'u'
          AND t.relname = 'rtv_equipos'
          AND a.attname = 'serial_equipo'
          AND a.attnum = ANY (c.conkey)
    LOOP
        EXECUTE format('ALTER TABLE public.rtv_equipos DROP CONSTRAINT %I', r.conname);
    END LOOP;

    -- UNIQUE indexes
    FOR r IN
        SELECT indexname
        FROM pg_indexes
        WHERE schemaname = 'public'
          AND tablename = 'rtv_equipos'
          AND indexdef ILIKE '%serial_equipo%'
          AND indexdef ILIKE '%UNIQUE%'
    LOOP
        EXECUTE format('DROP INDEX IF EXISTS public.%I', r.indexname);
    END LOOP;
END $$;

