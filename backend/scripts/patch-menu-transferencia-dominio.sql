-- Nueva opción de menú: Transferencia de dominio (Gestión vehicular).
-- PostgreSQL. Ejecute en su base existente.

INSERT INTO srtv_opcion_menu (clave, nombre_visible, modulo, orden)
SELECT 'menu_transferencia_dominio', 'Transferencia de dominio', 'Menú', 55
WHERE NOT EXISTS (SELECT 1 FROM srtv_opcion_menu WHERE clave = 'menu_transferencia_dominio');

-- Opcional: asignar al rol administrador (ajuste rol_id si aplica).
-- INSERT INTO srtv_rol_opcion_menu (rol_id, opcion_menu_id)
-- SELECT 1, opcion_menu_id FROM srtv_opcion_menu WHERE clave = 'menu_transferencia_dominio'
-- ON CONFLICT DO NOTHING;
