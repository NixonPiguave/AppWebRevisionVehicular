-- Ejecutar si la tabla srtv_auditoria ya existe sin estas columnas.
-- Agrega tipo_accion, entidad y detalle para auditoría detallada.

ALTER TABLE srtv_auditoria
  ADD COLUMN IF NOT EXISTS tipo_accion VARCHAR(20),
  ADD COLUMN IF NOT EXISTS entidad VARCHAR(100),
  ADD COLUMN IF NOT EXISTS detalle VARCHAR(1000);

-- Si tu BD no soporta IF NOT EXISTS en ADD COLUMN, usa solo:
-- ALTER TABLE srtv_auditoria ADD COLUMN tipo_accion VARCHAR(20);
-- ALTER TABLE srtv_auditoria ADD COLUMN entidad VARCHAR(100);
-- ALTER TABLE srtv_auditoria ADD COLUMN detalle VARCHAR(1000);
