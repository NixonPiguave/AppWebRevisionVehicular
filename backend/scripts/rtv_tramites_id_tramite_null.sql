-- Hace id_tramite y otros FKs opcionales en tablas de trámites RTV para permitir registro desde módulos (solicitud inicial).
-- Ejecutar en la base de datos del proyecto.

-- Primera matriculación
ALTER TABLE public.rtv_primera_matriculacion ALTER COLUMN id_tramite DROP NOT NULL;
ALTER TABLE public.rtv_primera_matriculacion ALTER COLUMN inspeccion_id DROP NOT NULL;
ALTER TABLE public.rtv_primera_matriculacion ALTER COLUMN id_calendarizacion DROP NOT NULL;

-- Duplicado matrícula
ALTER TABLE public.rtv_duplicado_matricula ALTER COLUMN id_tramite DROP NOT NULL;
ALTER TABLE public.rtv_duplicado_matricula ALTER COLUMN placa_anterior_id DROP NOT NULL;
ALTER TABLE public.rtv_duplicado_matricula ALTER COLUMN placa_nueva_id DROP NOT NULL;

-- Duplicado doc circulación
ALTER TABLE public.rtv_duplicado_doc_circulacion ALTER COLUMN id_tramite DROP NOT NULL;
ALTER TABLE public.rtv_duplicado_doc_circulacion ALTER COLUMN documento_original_id DROP NOT NULL;
ALTER TABLE public.rtv_duplicado_doc_circulacion ALTER COLUMN documento_nuevo_id DROP NOT NULL;

-- Transferencia dominio (inspeccion ya nullable en entidad)
ALTER TABLE public.rtv_transferencia_dominio_srv ALTER COLUMN id_tramite DROP NOT NULL;

-- Cambio servicio
ALTER TABLE public.rtv_cambio_servicio_srv ALTER COLUMN id_tramite DROP NOT NULL;
ALTER TABLE public.rtv_cambio_servicio_srv ALTER COLUMN placa_baja_id DROP NOT NULL;
ALTER TABLE public.rtv_cambio_servicio_srv ALTER COLUMN placa_nueva_id DROP NOT NULL;

-- Matriculación carga
ALTER TABLE public.rtv_matriculacion_carga ALTER COLUMN id_tramite DROP NOT NULL;
ALTER TABLE public.rtv_matriculacion_carga ALTER COLUMN inspeccion_id DROP NOT NULL;
ALTER TABLE public.rtv_matriculacion_carga ALTER COLUMN id_calendarizacion DROP NOT NULL;

-- Cambio características
ALTER TABLE public.rtv_cambio_caracteristicas_srv ALTER COLUMN id_tramite DROP NOT NULL;
ALTER TABLE public.rtv_cambio_caracteristicas_srv ALTER COLUMN observacion_vehiculo_id DROP NOT NULL;

-- Casos especial matriculación
ALTER TABLE public.rtv_caso_especial_matriculacion ALTER COLUMN id_tramite DROP NOT NULL;
