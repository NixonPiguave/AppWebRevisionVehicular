-- Compatible with existing vehicles; no backfill or fabricated images.
ALTER TABLE cv_vehiculo ADD COLUMN IF NOT EXISTS foto_url varchar(2048);
