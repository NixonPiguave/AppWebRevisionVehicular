-- Migración: tarifas por categoría de vehículo (rtv_tarifario_tramite.id_categoria)
-- PostgreSQL. Ejecutar una vez antes o después del arranque con ddl-auto (revisar orden).
--
-- El PDF oficial "001-dir-2026-ant ... CUADRO TARIFARIO DE VALORES 2026" es escaneado;
-- los montos de referencia RTV y otros trámites frecuentes se alinean con tablas publicadas
-- (p. ej. resumen en ecuadorec.com / eldiario.ec, marzo 2026). Verifique siempre contra el PDF.

-- 1) Columna opcional
ALTER TABLE rtv_tarifario_tramite
    ADD COLUMN IF NOT EXISTS id_categoria BIGINT NULL
    REFERENCES cv_categoria (categoriaid);

-- 2) Quitar unicidad antigua (un solo precio por servicio/periodo/estado)
ALTER TABLE rtv_tarifario_tramite DROP CONSTRAINT IF EXISTS rtv_tarifario_tramite_tipo_periodo_key;

-- 3) Índices únicos parciales: sin categoría = tarifa genérica; con categoría = una fila por categoría
CREATE UNIQUE INDEX IF NOT EXISTS uq_tarifario_tramite_sin_categoria
    ON rtv_tarifario_tramite (id_tipo_tramite, periodo, estado)
    WHERE id_categoria IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_tarifario_tramite_con_categoria
    ON rtv_tarifario_tramite (id_tipo_tramite, periodo, estado, id_categoria)
    WHERE id_categoria IS NOT NULL;

COMMENT ON COLUMN rtv_tarifario_tramite.id_categoria IS
    'Si no es NULL, la tarifa aplica solo a vehículos de esa cv_categoria (ej. L=motos).';
