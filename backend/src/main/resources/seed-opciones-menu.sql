-- Tablas para accesos de menú por rol (no usar srtv_permiso para esto).
-- Ejecute este script una vez. Si usa JPA con ddl-auto=update, las tablas se crean solas; solo hace falta insertar datos.
-- Sintaxis para PostgreSQL. En MySQL use BIGINT AUTO_INCREMENT en lugar de BIGSERIAL.

-- Crear tabla de opciones de menú (catálogo)
CREATE TABLE IF NOT EXISTS srtv_opcion_menu (
    opcion_menu_id BIGSERIAL PRIMARY KEY,
    clave VARCHAR(100) NOT NULL UNIQUE,
    nombre_visible VARCHAR(150),
    modulo VARCHAR(100),
    orden INT DEFAULT 0
);

-- Crear tabla de relación rol - opción de menú
CREATE TABLE IF NOT EXISTS srtv_rol_opcion_menu (
    rol_opcion_menu_id BIGSERIAL PRIMARY KEY,
    rol_id BIGINT NOT NULL REFERENCES srtv_rol(rol_id) ON DELETE CASCADE,
    opcion_menu_id BIGINT NOT NULL REFERENCES srtv_opcion_menu(opcion_menu_id) ON DELETE CASCADE,
    UNIQUE(rol_id, opcion_menu_id)
);

-- Solo opciones hoja (y Dashboard/Registro trámite). Los contenedores (Operaciones, Gestión Vehicular, etc.)
-- se muestran implícitamente cuando el rol tiene al menos una opción hija.
INSERT INTO srtv_opcion_menu (clave, nombre_visible, modulo, orden) VALUES
('menu_dashboard', 'Dashboard', 'Menú', 1),
('menu_registro_tramite', 'Registro de Trámite', 'Menú', 2),
('menu_vehiculos', 'Vehículos', 'Menú', 3),
('menu_propietario', 'Propietario', 'Menú', 4),
('menu_revisiones', 'Revisiones', 'Menú', 5),
('menu_resultados_revision', 'Resultados de Revisión', 'Menú', 6),
('menu_bloqueo', 'Bloqueo', 'Menú', 7),
('menu_desbloqueo', 'Desbloqueo', 'Menú', 8),
('menu_baja', 'Baja', 'Menú', 9),
('menu_pagos', 'Pagos', 'Menú', 10),
('menu_recepcion', 'Recepción', 'Menú', 11),
('menu_historial_turnos', 'Historial de Turnos', 'Menú', 12),
('menu_certificados', 'Certificados', 'Menú', 13),
('menu_catalogo_marcas', 'Marcas', 'Menú', 14),
('menu_catalogo_modelos', 'Modelos', 'Menú', 15),
('menu_catalogo_tipo_vehiculo', 'Tipos de Vehículo', 'Menú', 16),
('menu_catalogo_clases', 'Clases', 'Menú', 17),
('menu_catalogo_categorias', 'Categorías', 'Menú', 18),
('menu_catalogo_subcategorias', 'Subcategorías', 'Menú', 18),
('menu_catalogo_tipo_combustible', 'Tipos de Combustible', 'Menú', 19),
('menu_catalogo_tipo_matricula', 'Tipos de Matrícula', 'Menú', 20),
('menu_catalogo_traccion', 'Tracción', 'Menú', 21),
('menu_catalogo_ejes', 'Ejes', 'Menú', 22),
('menu_catalogo_capacidad', 'Capacidad de Carga', 'Menú', 23),
('menu_catalogo_ambito', 'Ámbito Operacional', 'Menú', 24),
('menu_inspeccion_turnos_pagados', 'Registrar Inspección', 'Menú', 25),
('menu_inspeccion_lineas', 'Líneas de Inspección', 'Menú', 26),
('menu_inspeccion_metodos', 'Métodos de Inspección', 'Menú', 27),
('menu_inspeccion_equipos', 'Equipos', 'Menú', 28),
('menu_defectos_familia', 'Familias de Defectos', 'Menú', 29),
('menu_defectos_subfamilia', 'Subfamilias de Defectos', 'Menú', 30),
('menu_defectos_categoria', 'Categorías de Defectos', 'Menú', 31),
('menu_defectos_tipos', 'Tipos de Defectos', 'Menú', 32),
('menu_defectos', 'Defectos', 'Menú', 33),
('menu_ant', 'ANT / Trámites', 'Menú', 34),
('menu_umbral_unidades', 'Unidades de Medida', 'Menú', 35),
('menu_umbral_descripcion', 'Descripción de Umbral', 'Menú', 36),
('menu_umbral', 'Umbral', 'Menú', 37),
('menu_usuarios', 'Usuarios', 'Menú', 38),
('menu_roles', 'Roles', 'Menú', 39),
('menu_areas', 'Áreas', 'Menú', 40),
('menu_empresa', 'Empresa', 'Menú', 41),
('menu_turnos', 'Turnos', 'Menú', 42),
('menu_auditoria', 'Auditoría', 'Menú', 43),
('menu_accesos_rol', 'Accesos por rol', 'Menú', 44),
('menu_sesiones_activas', 'Sesiones activas', 'Menú', 45),
('menu_registro_observaciones', 'Registro de Observaciones', 'Menú', 46),
('menu_registro_incidentes', 'Registro de Incidentes', 'Menú', 47),
('menu_anulacion_tramites', 'Anulación de Trámites', 'Menú', 48),
('menu_registro_base_unica', 'Registro Base Única', 'Menú', 49),
('menu_backup', 'Respaldos', 'Menú', 50);
