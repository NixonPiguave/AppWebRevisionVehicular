-- Recupera exclusivamente el login indicado, con las credenciales y membresías
-- que ya constan en la aplicación. No cambia contraseñas ni roles existentes.
-- Ejecutar con psql -v usuario_app=nombre_usuario -f reparar-login-postgres.sql
\set ON_ERROR_STOP on
BEGIN;
SELECT set_config('rtv.reparar_usuario', :'usuario_app', true);
DO $$
DECLARE
    cuenta RECORD;
    permiso RECORD;
BEGIN
    SELECT usuario_base_datos, contrasena_base_datos INTO STRICT cuenta
    FROM public.srtv_usuario
    WHERE usuario = current_setting('rtv.reparar_usuario');

    IF cuenta.usuario_base_datos IS NULL OR cuenta.usuario_base_datos NOT LIKE 'usr_%'
       OR cuenta.contrasena_base_datos IS NULL OR cuenta.contrasena_base_datos = '' THEN
        RAISE EXCEPTION 'La cuenta no tiene credenciales PostgreSQL recuperables';
    END IF;
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = cuenta.usuario_base_datos) THEN
        RAISE EXCEPTION 'El login ya existe; no se modificó';
    END IF;

    EXECUTE format('CREATE ROLE %I LOGIN PASSWORD %L',
        cuenta.usuario_base_datos, cuenta.contrasena_base_datos);

    FOR permiso IN
        SELECT DISTINCT p.nombre
        FROM public.srtv_usuario u
        JOIN public.srtv_usuario_roles ur ON ur.usuario_id = u.usuario_id
        JOIN public.srtv_rol_permisos rp ON rp.rol_id = ur.rol_id
        JOIN public.srtv_permiso p ON p.permiso_id = rp.permiso_id
        WHERE u.usuario = current_setting('rtv.reparar_usuario')
          AND p.estado = 'ACTIVO' AND p.nombre IS NOT NULL
    LOOP
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = permiso.nombre) THEN
            RAISE EXCEPTION 'Falta un rol de permisos; se cancela la recuperación';
        END IF;
        EXECUTE format('GRANT %I TO %I', permiso.nombre, cuenta.usuario_base_datos);
    END LOOP;
END $$;
COMMIT;
