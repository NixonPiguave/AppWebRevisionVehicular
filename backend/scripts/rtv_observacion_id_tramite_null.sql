-- Permitir id_tramite NULL en Registro de Observaciones (alineado con bloqueo/desbloqueo/baja).
ALTER TABLE public.rtv_observacion_vehiculo_srv
  ALTER COLUMN id_tramite DROP NOT NULL;
