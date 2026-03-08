-- Permite registrar vehículos en la Base Única sin trámite previo (id_tramite opcional).
-- Ejecutar en la base de datos del proyecto.

ALTER TABLE public.rtv_registro_base_unica_vehiculo
  ALTER COLUMN id_tramite DROP NOT NULL;

COMMENT ON COLUMN public.rtv_registro_base_unica_vehiculo.id_tramite IS 'Opcional: trámite asociado si existe';
