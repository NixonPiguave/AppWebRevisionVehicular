-- ============================================================
-- Permitir id_tramite NULL en rtv_baja_vehiculo
-- (Alineado con bloqueo y desbloqueo: el trámite es opcional)
-- Motor: PostgreSQL
-- ============================================================

ALTER TABLE rtv_baja_vehiculo
  ALTER COLUMN id_tramite DROP NOT NULL;
