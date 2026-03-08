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

-- Insertar opciones de menú (claves que usa el frontend para mostrar/ocultar ítems)
INSERT INTO srtv_opcion_menu (clave, nombre_visible, modulo, orden) VALUES
('menu_dashboard', 'Dashboard', 'Menú', 1),
('menu_registro_tramite', 'Registro de Trámite', 'Menú', 2),
('menu_gestion_vehicular', 'Gestión Vehicular', 'Menú', 3),
('menu_vehiculos', 'Vehículos', 'Menú', 4),
('menu_propietario', 'Propietario', 'Menú', 5),
('menu_revisiones', 'Revisiones', 'Menú', 6),
('menu_resultados_revision', 'Resultados de Revisión', 'Menú', 7),
('menu_tramites_legales', 'Trámites legales', 'Menú', 8),
('menu_bloqueo', 'Bloqueo', 'Menú', 9),
('menu_desbloqueo', 'Desbloqueo', 'Menú', 10),
('menu_baja', 'Baja', 'Menú', 11),
('menu_operaciones', 'Operaciones', 'Menú', 12),
('menu_pagos', 'Pagos', 'Menú', 13),
('menu_recepcion', 'Recepción', 'Menú', 14),
('menu_certificados', 'Certificados', 'Menú', 15),
('menu_catalogo_vehiculos', 'Catálogo de Vehículos', 'Menú', 16),
('menu_catalogo_marcas', 'Marcas', 'Menú', 17),
('menu_catalogo_modelos', 'Modelos', 'Menú', 18),
('menu_catalogo_tipo_vehiculo', 'Tipos de Vehículo', 'Menú', 19),
('menu_catalogo_clases', 'Clases', 'Menú', 20),
('menu_catalogo_categorias', 'Categorías', 'Menú', 21),
('menu_catalogo_subcategorias', 'Subcategorías', 'Menú', 22),
('menu_catalogo_tipo_combustible', 'Tipos de Combustible', 'Menú', 23),
('menu_catalogo_tipo_matricula', 'Tipos de Matrícula', 'Menú', 24),
('menu_catalogo_traccion', 'Tracción', 'Menú', 25),
('menu_catalogo_ejes', 'Ejes', 'Menú', 26),
('menu_catalogo_capacidad', 'Capacidad de Carga', 'Menú', 27),
('menu_catalogo_ambito', 'Ámbito Operacional', 'Menú', 28),
('menu_inspeccion_rtv', 'Inspección RTV', 'Menú', 29),
('menu_inspeccion_turnos_pagados', 'Registrar Inspección', 'Menú', 30),
('menu_inspeccion_lineas', 'Líneas de Inspección', 'Menú', 31),
('menu_inspeccion_metodos', 'Métodos de Inspección', 'Menú', 32),
('menu_inspeccion_equipos', 'Equipos', 'Menú', 33),
('menu_defectos_inspeccion', 'Defectos de Inspección', 'Menú', 34),
('menu_defectos_familia', 'Familias de Defectos', 'Menú', 35),
('menu_defectos_subfamilia', 'Subfamilias de Defectos', 'Menú', 36),
('menu_defectos_categoria', 'Categorías de Defectos', 'Menú', 37),
('menu_defectos_tipos', 'Tipos de Defectos', 'Menú', 38),
('menu_defectos', 'Defectos', 'Menú', 39),
('menu_ant', 'ANT / Trámites', 'Menú', 40),
('menu_configuracion_umbral', 'Configuración Umbral', 'Menú', 41),
('menu_umbral_unidades', 'Unidades de Medida', 'Menú', 42),
('menu_umbral_descripcion', 'Descripción de Umbral', 'Menú', 43),
('menu_umbral', 'Umbral', 'Menú', 44),
('menu_administracion', 'Administración', 'Menú', 45),
('menu_usuarios', 'Usuarios', 'Menú', 46),
('menu_roles', 'Roles', 'Menú', 47),
('menu_areas', 'Áreas', 'Menú', 48),
('menu_empresa', 'Empresa', 'Menú', 49),
('menu_turnos', 'Turnos', 'Menú', 50),
('menu_auditoria', 'Auditoría', 'Menú', 51),
('menu_accesos_rol', 'Accesos por rol', 'Menú', 52);

-- Si su BD es MySQL use AUTO_INCREMENT en lugar de BIGSERIAL y evite ON CONFLICT.
-- Si ya existen filas con estas claves, omita el INSERT o use INSERT IGNORE (MySQL).
