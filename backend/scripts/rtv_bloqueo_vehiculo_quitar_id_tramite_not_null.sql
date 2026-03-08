-- ============================================================
-- Permitir id_tramite NULL en rtv_bloqueo_vehiculo_srv
-- (Los SP ya no reciben p_id_tramite; la columna debe aceptar NULL)
-- Motor: PostgreSQL
-- ============================================================

ALTER TABLE rtv_bloqueo_vehiculo_srv
  ALTER COLUMN id_tramite DROP NOT NULL;

-- Opcional: si ya no usas id_tramite en ningún lado, puedes eliminar la columna:
-- ALTER TABLE rtv_bloqueo_vehiculo_srv DROP COLUMN IF EXISTS id_tramite;
