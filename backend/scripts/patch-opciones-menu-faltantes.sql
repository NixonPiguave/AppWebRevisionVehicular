-- Parche: opciones de menú por submenú (Trámites legales desglosadas + Respaldos).
-- Ejecute si hizo TRUNCATE y le faltan estas opciones. PostgreSQL.

INSERT INTO srtv_opcion_menu (clave, nombre_visible, modulo, orden)
SELECT 'menu_registro_observaciones', 'Registro de Observaciones', 'Menú', 46
WHERE NOT EXISTS (SELECT 1 FROM srtv_opcion_menu WHERE clave = 'menu_registro_observaciones');

INSERT INTO srtv_opcion_menu (clave, nombre_visible, modulo, orden)
SELECT 'menu_registro_incidentes', 'Registro de Incidentes', 'Menú', 47
WHERE NOT EXISTS (SELECT 1 FROM srtv_opcion_menu WHERE clave = 'menu_registro_incidentes');

INSERT INTO srtv_opcion_menu (clave, nombre_visible, modulo, orden)
SELECT 'menu_anulacion_tramites', 'Anulación de Trámites', 'Menú', 48
WHERE NOT EXISTS (SELECT 1 FROM srtv_opcion_menu WHERE clave = 'menu_anulacion_tramites');

INSERT INTO srtv_opcion_menu (clave, nombre_visible, modulo, orden)
SELECT 'menu_registro_base_unica', 'Registro Base Única', 'Menú', 49
WHERE NOT EXISTS (SELECT 1 FROM srtv_opcion_menu WHERE clave = 'menu_registro_base_unica');

INSERT INTO srtv_opcion_menu (clave, nombre_visible, modulo, orden)
SELECT 'menu_backup', 'Respaldos', 'Menú', 50
WHERE NOT EXISTS (SELECT 1 FROM srtv_opcion_menu WHERE clave = 'menu_backup');

-- Opcional: asignar al rol administrador (rol_id = 1). Ajuste el 1 si su rol admin tiene otro id.
-- INSERT INTO srtv_rol_opcion_menu (rol_id, opcion_menu_id)
-- SELECT 1, opcion_menu_id FROM srtv_opcion_menu WHERE clave IN ('menu_registro_observaciones','menu_registro_incidentes','menu_anulacion_tramites','menu_registro_base_unica','menu_backup');
-- (Descomente y ajuste rol_id si lo necesita.)
