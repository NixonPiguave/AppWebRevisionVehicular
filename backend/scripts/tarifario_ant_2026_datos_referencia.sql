-- =============================================================================
-- REFERENCIA DE VALORES ANT 2026 (vigencia desde 09-mar-2026 según prensa oficial)
-- Fuente secundaria: tablas resumidas en medios (ecuadorec.com, eldiario.ec).
-- CONTRASTAR SIEMPRE con el PDF oficial "CUADRO TARIFARIO DE VALORES 2026".
-- =============================================================================
--
-- Revisión técnica vehicular (RTV) — tres escalas publicadas:
--   Motocicletas y plataformas (categoría L típica):     USD 15,86
--   Taxis, busetas, furgonetas (transporte mixto):      USD 18,19
--   Vehículos livianos (particulares):                   USD 26,58
--
-- Otros trámites frecuentes (mismo tarifario general ANT 2026):
--   Licencia no profesional A/B (primera vez o renovación):  USD 68
--   Licencia profesional A1,C,C1,D,E,G (primera o renovación): USD 110
--   Duplicado licencia (no prof. o prof.):                    USD 26
--   Bloqueo o desbloqueo de vehículos:                        USD 7,50
--   Tasa anual matriculación particulares (auto):            USD 36
--   Tasa anual matriculación motos:                          USD 31
--
-- =============================================================================
-- APLICAR PRECIOS RTV POR cv_categoria (ejemplo)
-- Requisitos: haber ejecutado tarifario_ant_2026_migracion.sql
-- Ajuste id_tipo_tramite al ID real de "Revisión técnica vehicular" en su BD.
-- =============================================================================

-- Descomente y reemplace :id_servicio_rtv con el ID correcto:

/*
WITH srv AS (SELECT :id_servicio_rtv::bigint AS id)
INSERT INTO rtv_tarifario_tramite (
    id_tipo_tramite, codificacion, nombre_tramite, descripcion,
    direccion_duena_proceso, tarifa, periodo, estado, id_categoria
)
SELECT
    srv.id,
    'RTV-2026-L',
    nombre_tramite,
    descripcion,
    direccion_duena_proceso,
    15.86,
    periodo,
    'ACTIVO',
    c.categoriaid
FROM rtv_tarifario_tramite t
CROSS JOIN srv
JOIN cv_categoria c ON upper(trim(c.codigo)) = 'L'
WHERE t.id_tipo_tramite = srv.id AND t.estado = 'ACTIVO' AND t.id_categoria IS NULL
LIMIT 1
ON CONFLICT DO NOTHING;
*/

-- Patrón recomendado en la aplicación:
-- 1) Mantenga UNA fila con id_categoria NULL como respaldo (tarifa por defecto).
-- 2) Añada filas con id_categoria = categoriaid para L, M, N, … según su catálogo.
-- 3) Livianos M/N → 26,58 | L (motos) → 15,86 | taxis/busetas/furgon (según categoría
--    que use su sistema, p. ej. códigos de transporte) → 18,19.
