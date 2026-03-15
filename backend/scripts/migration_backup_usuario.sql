-- Migración: asociar usuario a entidades de backup
-- Añade columna usuario_id (FK a srtv_usuario) en tablas de backup.
-- Ejecutar solo si las columnas no existen aún.

-- BackupConfig
ALTER TABLE srtv_backup_config ADD COLUMN usuario_id BIGINT NULL;
ALTER TABLE srtv_backup_config
    ADD CONSTRAINT fk_backup_config_usuario
    FOREIGN KEY (usuario_id) REFERENCES srtv_usuario(usuario_id);

-- BackupRecord
ALTER TABLE srtv_backup_record ADD COLUMN usuario_id BIGINT NULL;
ALTER TABLE srtv_backup_record
    ADD CONSTRAINT fk_backup_record_usuario
    FOREIGN KEY (usuario_id) REFERENCES srtv_usuario(usuario_id);

-- BackupNotification
ALTER TABLE srtv_backup_notification ADD COLUMN usuario_id BIGINT NULL;
ALTER TABLE srtv_backup_notification
    ADD CONSTRAINT fk_backup_notification_usuario
    FOREIGN KEY (usuario_id) REFERENCES srtv_usuario(usuario_id);
