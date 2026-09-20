-- Permisos del administrador recuperados del respaldo backup_full_20260321_151529.backup.
-- Solo se aplican a tablas/secuencias existentes; no restaura datos ni crea objetos.
\set ON_ERROR_STOP on
BEGIN;
DO $$
BEGIN
    IF to_regclass('public.ant_baja_vehiculo') IS NOT NULL THEN
        GRANT ALL ON TABLE public.ant_baja_vehiculo TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_baja_vehiculo_id_baja_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.ant_baja_vehiculo_id_baja_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_beneficiario_leasing') IS NOT NULL THEN
        GRANT ALL ON TABLE public.ant_beneficiario_leasing TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_beneficiario_leasing_id_beneficiario_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.ant_beneficiario_leasing_id_beneficiario_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_bloqueo_vehiculo') IS NOT NULL THEN
        GRANT ALL ON TABLE public.ant_bloqueo_vehiculo TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_bloqueo_vehiculo_id_bloqueo_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.ant_bloqueo_vehiculo_id_bloqueo_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_calendarizacion_matriculacion') IS NOT NULL THEN
        GRANT ALL ON TABLE public.ant_calendarizacion_matriculacion TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_calendarizacion_matriculacion_id_calendarizacion_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.ant_calendarizacion_matriculacion_id_calendarizacion_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_convenio_pago') IS NOT NULL THEN
        GRANT ALL ON TABLE public.ant_convenio_pago TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_convenio_pago_id_convenio_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.ant_convenio_pago_id_convenio_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_convenio_pago_multa') IS NOT NULL THEN
        GRANT ALL ON TABLE public.ant_convenio_pago_multa TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_convenio_pago_multa_id_convenio_multa_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.ant_convenio_pago_multa_id_convenio_multa_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_cuota_convenio') IS NOT NULL THEN
        GRANT ALL ON TABLE public.ant_cuota_convenio TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_cuota_convenio_id_cuota_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.ant_cuota_convenio_id_cuota_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_detalle_pago_consolidado') IS NOT NULL THEN
        GRANT ALL ON TABLE public.ant_detalle_pago_consolidado TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_detalle_pago_consolidado_id_detalle_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.ant_detalle_pago_consolidado_id_detalle_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_deuda_vehicular') IS NOT NULL THEN
        GRANT ALL ON TABLE public.ant_deuda_vehicular TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_deuda_vehicular_id_deuda_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.ant_deuda_vehicular_id_deuda_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_entidad_transito') IS NOT NULL THEN
        GRANT ALL ON TABLE public.ant_entidad_transito TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_entidad_transito_id_entidad_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.ant_entidad_transito_id_entidad_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_entrega_placa') IS NOT NULL THEN
        GRANT ALL ON TABLE public.ant_entrega_placa TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_entrega_placa_id_entrega_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.ant_entrega_placa_id_entrega_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_estado_excepcion') IS NOT NULL THEN
        GRANT ALL ON TABLE public.ant_estado_excepcion TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_estado_excepcion_id_estado_excepcion_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.ant_estado_excepcion_id_estado_excepcion_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_estado_multa') IS NOT NULL THEN
        GRANT ALL ON TABLE public.ant_estado_multa TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_estado_multa_id_estado_multa_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.ant_estado_multa_id_estado_multa_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_excepcion_matricula_vehiculo') IS NOT NULL THEN
        GRANT ALL ON TABLE public.ant_excepcion_matricula_vehiculo TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_excepcion_matricula_vehiculo_id_excepcion_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.ant_excepcion_matricula_vehiculo_id_excepcion_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_exencion_arancelaria') IS NOT NULL THEN
        GRANT ALL ON TABLE public.ant_exencion_arancelaria TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_exencion_arancelaria_id_exencion_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.ant_exencion_arancelaria_id_exencion_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_exoneracion_multa_cal') IS NOT NULL THEN
        GRANT ALL ON TABLE public.ant_exoneracion_multa_cal TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_exoneracion_multa_cal_id_exoneracion_cal_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.ant_exoneracion_multa_cal_id_exoneracion_cal_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_historial_infraccion_vehiculo') IS NOT NULL THEN
        GRANT ALL ON TABLE public.ant_historial_infraccion_vehiculo TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_historial_infraccion_vehiculo_id_historial_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.ant_historial_infraccion_vehiculo_id_historial_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_homologacion') IS NOT NULL THEN
        GRANT ALL ON TABLE public.ant_homologacion TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_homologacion_id_homologacion_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.ant_homologacion_id_homologacion_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_multa') IS NOT NULL THEN
        GRANT ALL ON TABLE public.ant_multa TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_multa_anual_matriculacion') IS NOT NULL THEN
        GRANT ALL ON TABLE public.ant_multa_anual_matriculacion TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_multa_anual_matriculacion_id_multa_anual_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.ant_multa_anual_matriculacion_id_multa_anual_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_multa_calendarizacion') IS NOT NULL THEN
        GRANT ALL ON TABLE public.ant_multa_calendarizacion TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_multa_calendarizacion_id_multa_cal_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.ant_multa_calendarizacion_id_multa_cal_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_multa_id_multa_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.ant_multa_id_multa_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_observacion_vehiculo') IS NOT NULL THEN
        GRANT ALL ON TABLE public.ant_observacion_vehiculo TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_observacion_vehiculo_id_observacion_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.ant_observacion_vehiculo_id_observacion_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_pago_consolidado_tramite') IS NOT NULL THEN
        GRANT ALL ON TABLE public.ant_pago_consolidado_tramite TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_pago_consolidado_tramite_id_pago_consolidado_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.ant_pago_consolidado_tramite_id_pago_consolidado_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_pago_deuda_vehicular') IS NOT NULL THEN
        GRANT ALL ON TABLE public.ant_pago_deuda_vehicular TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_pago_deuda_vehicular_id_pago_deuda_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.ant_pago_deuda_vehicular_id_pago_deuda_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_pago_multa') IS NOT NULL THEN
        GRANT ALL ON TABLE public.ant_pago_multa TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_pago_multa_id_pago_multa_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.ant_pago_multa_id_pago_multa_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_placa') IS NOT NULL THEN
        GRANT ALL ON TABLE public.ant_placa TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_placa_disponible') IS NOT NULL THEN
        GRANT ALL ON TABLE public.ant_placa_disponible TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_placa_disponible_id_placa_disponible_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.ant_placa_disponible_id_placa_disponible_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_placa_id_placa_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.ant_placa_id_placa_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_placa_secuencia') IS NOT NULL THEN
        GRANT ALL ON TABLE public.ant_placa_secuencia TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_placa_secuencia_id_secuencia_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.ant_placa_secuencia_id_secuencia_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_retraso_matriculacion') IS NOT NULL THEN
        GRANT ALL ON TABLE public.ant_retraso_matriculacion TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_retraso_matriculacion_id_retraso_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.ant_retraso_matriculacion_id_retraso_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_solicitud_placas') IS NOT NULL THEN
        GRANT ALL ON TABLE public.ant_solicitud_placas TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_solicitud_placas_id_solicitud_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.ant_solicitud_placas_id_solicitud_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_tarifario') IS NOT NULL THEN
        GRANT ALL ON TABLE public.ant_tarifario TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_tarifario_id_tarifario_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.ant_tarifario_id_tarifario_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_tipo_bloqueo') IS NOT NULL THEN
        GRANT ALL ON TABLE public.ant_tipo_bloqueo TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_tipo_bloqueo_id_tipo_bloqueo_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.ant_tipo_bloqueo_id_tipo_bloqueo_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_tipo_deuda_vehicular') IS NOT NULL THEN
        GRANT ALL ON TABLE public.ant_tipo_deuda_vehicular TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_tipo_deuda_vehicular_id_tipo_deuda_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.ant_tipo_deuda_vehicular_id_tipo_deuda_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_validacion_deuda_tramite') IS NOT NULL THEN
        GRANT ALL ON TABLE public.ant_validacion_deuda_tramite TO rol_administrador;
    END IF;
    IF to_regclass('public.ant_validacion_deuda_tramite_id_validacion_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.ant_validacion_deuda_tramite_id_validacion_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.bund_actualizacion_persona') IS NOT NULL THEN
        GRANT ALL ON TABLE public.bund_actualizacion_persona TO rol_administrador;
    END IF;
    IF to_regclass('public.bund_actualizacion_persona_id_actualizacion_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.bund_actualizacion_persona_id_actualizacion_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.bund_incidente') IS NOT NULL THEN
        GRANT ALL ON TABLE public.bund_incidente TO rol_administrador;
    END IF;
    IF to_regclass('public.bund_incidente_id_incidente_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.bund_incidente_id_incidente_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.cv_ambito_operacional') IS NOT NULL THEN
        GRANT ALL ON TABLE public.cv_ambito_operacional TO rol_administrador;
    END IF;
    IF to_regclass('public.cv_ambito_operacional_ambito_operacionalid_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.cv_ambito_operacional_ambito_operacionalid_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.cv_cap_carga') IS NOT NULL THEN
        GRANT ALL ON TABLE public.cv_cap_carga TO rol_administrador;
    END IF;
    IF to_regclass('public.cv_cap_carga_capcargaid_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.cv_cap_carga_capcargaid_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.cv_categoria') IS NOT NULL THEN
        GRANT ALL ON TABLE public.cv_categoria TO rol_administrador;
    END IF;
    IF to_regclass('public.cv_categoria_categoriaid_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.cv_categoria_categoriaid_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.cv_clase') IS NOT NULL THEN
        GRANT ALL ON TABLE public.cv_clase TO rol_administrador;
    END IF;
    IF to_regclass('public.cv_clase_clase_id_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.cv_clase_clase_id_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.cv_datos_fabrica') IS NOT NULL THEN
        GRANT ALL ON TABLE public.cv_datos_fabrica TO rol_administrador;
    END IF;
    IF to_regclass('public.cv_datos_fabrica_datos_fabrica_id_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.cv_datos_fabrica_datos_fabrica_id_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.cv_ejes') IS NOT NULL THEN
        GRANT ALL ON TABLE public.cv_ejes TO rol_administrador;
    END IF;
    IF to_regclass('public.cv_ejes_ejes_id_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.cv_ejes_ejes_id_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.cv_marca_vehiculo') IS NOT NULL THEN
        GRANT ALL ON TABLE public.cv_marca_vehiculo TO rol_administrador;
    END IF;
    IF to_regclass('public.cv_marca_vehiculo_id_marca_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.cv_marca_vehiculo_id_marca_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.cv_modelo_vehiculo') IS NOT NULL THEN
        GRANT ALL ON TABLE public.cv_modelo_vehiculo TO rol_administrador;
    END IF;
    IF to_regclass('public.cv_modelo_vehiculo_id_modelo_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.cv_modelo_vehiculo_id_modelo_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.cv_subcategoria') IS NOT NULL THEN
        GRANT ALL ON TABLE public.cv_subcategoria TO rol_administrador;
    END IF;
    IF to_regclass('public.cv_subcategoria_sub_categoria_id_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.cv_subcategoria_sub_categoria_id_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.cv_tipo_combustible') IS NOT NULL THEN
        GRANT ALL ON TABLE public.cv_tipo_combustible TO rol_administrador;
    END IF;
    IF to_regclass('public.cv_tipo_combustible_tipocombustibleid_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.cv_tipo_combustible_tipocombustibleid_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.cv_tipo_matricula') IS NOT NULL THEN
        GRANT ALL ON TABLE public.cv_tipo_matricula TO rol_administrador;
    END IF;
    IF to_regclass('public.cv_tipo_matricula_tipomatriculaid_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.cv_tipo_matricula_tipomatriculaid_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.cv_tipo_vehiculo') IS NOT NULL THEN
        GRANT ALL ON TABLE public.cv_tipo_vehiculo TO rol_administrador;
    END IF;
    IF to_regclass('public.cv_tipo_vehiculo_tipo_vehiculo_id_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.cv_tipo_vehiculo_tipo_vehiculo_id_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.cv_traccion') IS NOT NULL THEN
        GRANT ALL ON TABLE public.cv_traccion TO rol_administrador;
    END IF;
    IF to_regclass('public.cv_traccion_traccionid_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.cv_traccion_traccionid_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.cv_vehiculo') IS NOT NULL THEN
        GRANT ALL ON TABLE public.cv_vehiculo TO rol_administrador;
    END IF;
    IF to_regclass('public.cv_vehiculo_vehiculoid_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.cv_vehiculo_vehiculoid_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.pv_historial_propietario') IS NOT NULL THEN
        GRANT ALL ON TABLE public.pv_historial_propietario TO rol_administrador;
    END IF;
    IF to_regclass('public.pv_historial_propietario_id_historial_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.pv_historial_propietario_id_historial_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.pv_propietario') IS NOT NULL THEN
        GRANT ALL ON TABLE public.pv_propietario TO rol_administrador;
    END IF;
    IF to_regclass('public.pv_propietario_propietario_id_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.pv_propietario_propietario_id_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rc_descripcion_umbral') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rc_descripcion_umbral TO rol_administrador;
    END IF;
    IF to_regclass('public.rc_descripcion_umbral_descrip_umbral_id_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rc_descripcion_umbral_descrip_umbral_id_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rc_umbral') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rc_umbral TO rol_administrador;
    END IF;
    IF to_regclass('public.rc_umbral_umbral_id_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rc_umbral_umbral_id_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rc_unidad_medida') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rc_unidad_medida TO rol_administrador;
    END IF;
    IF to_regclass('public.rc_unidad_medida_umedida_id_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rc_unidad_medida_umedida_id_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_adhesivo_rtv') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rtv_adhesivo_rtv TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_adhesivo_rtv_id_adhesivo_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rtv_adhesivo_rtv_id_adhesivo_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_anulacion_tramite') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rtv_anulacion_tramite TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_anulacion_tramite_id_anulacion_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rtv_anulacion_tramite_id_anulacion_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_anulacion_tramite_srv') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rtv_anulacion_tramite_srv TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_anulacion_tramite_srv_id_anulacion_srv_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rtv_anulacion_tramite_srv_id_anulacion_srv_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_baja_vehiculo') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rtv_baja_vehiculo TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_baja_vehiculo_id_baja_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rtv_baja_vehiculo_id_baja_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_bloqueo_vehiculo_srv') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rtv_bloqueo_vehiculo_srv TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_bloqueo_vehiculo_srv_id_bloqueo_srv_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rtv_bloqueo_vehiculo_srv_id_bloqueo_srv_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_cambio_caracteristicas_srv') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rtv_cambio_caracteristicas_srv TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_cambio_caracteristicas_sr_id_cambio_caracteristicas_srv_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rtv_cambio_caracteristicas_sr_id_cambio_caracteristicas_srv_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_cambio_caracteristicas_vehiculo') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rtv_cambio_caracteristicas_vehiculo TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_cambio_caracteristicas_vehicul_id_cambio_caracteristica_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rtv_cambio_caracteristicas_vehicul_id_cambio_caracteristica_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_cambio_servicio') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rtv_cambio_servicio TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_cambio_servicio_id_cambio_servicio_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rtv_cambio_servicio_id_cambio_servicio_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_cambio_servicio_srv') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rtv_cambio_servicio_srv TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_cambio_servicio_srv_id_cambio_servicio_srv_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rtv_cambio_servicio_srv_id_cambio_servicio_srv_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_caso_especial_matriculacion') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rtv_caso_especial_matriculacion TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_caso_especial_matriculacion_id_caso_especial_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rtv_caso_especial_matriculacion_id_caso_especial_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_categoria') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rtv_categoria TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_categoria_rtvcategoria_id_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rtv_categoria_rtvcategoria_id_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_certificacion_vehicular') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rtv_certificacion_vehicular TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_certificacion_vehicular_id_certificacion_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rtv_certificacion_vehicular_id_certificacion_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_concesionaria') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rtv_concesionaria TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_concesionaria_id_concesionaria_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rtv_concesionaria_id_concesionaria_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_criterio_resultado') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rtv_criterio_resultado TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_criterio_resultado_criterio_id_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rtv_criterio_resultado_criterio_id_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_defecto') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rtv_defecto TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_defecto_defecto_id_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rtv_defecto_defecto_id_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_defectos_aceptados') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rtv_defectos_aceptados TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_defectos_aceptados_defecto_conf_id_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rtv_defectos_aceptados_defecto_conf_id_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_desbloqueo_vehiculo') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rtv_desbloqueo_vehiculo TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_desbloqueo_vehiculo_id_desbloqueo_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rtv_desbloqueo_vehiculo_id_desbloqueo_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_detalle_aceptar') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rtv_detalle_aceptar TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_detalle_aceptar_detalle_id_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rtv_detalle_aceptar_detalle_id_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_detalle_inspeccion') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rtv_detalle_inspeccion TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_detalle_inspeccion_detalle_inspeccion_id_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rtv_detalle_inspeccion_detalle_inspeccion_id_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_documento_circulacion') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rtv_documento_circulacion TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_documento_circulacion_id_documento_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rtv_documento_circulacion_id_documento_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_duplicado_doc_circulacion') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rtv_duplicado_doc_circulacion TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_duplicado_doc_circulacion_id_duplicado_doc_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rtv_duplicado_doc_circulacion_id_duplicado_doc_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_duplicado_matricula') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rtv_duplicado_matricula TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_duplicado_matricula_id_duplicado_matricula_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rtv_duplicado_matricula_id_duplicado_matricula_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_equipos') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rtv_equipos TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_equipos_equipo_id_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rtv_equipos_equipo_id_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_familia') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rtv_familia TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_familia_familiaid_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rtv_familia_familiaid_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_gestor_matriculacion') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rtv_gestor_matriculacion TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_gestor_matriculacion_id_gestor_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rtv_gestor_matriculacion_id_gestor_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_historial_tarifario_tramite') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rtv_historial_tarifario_tramite TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_historial_tarifario_tramite_id_tramite_historial_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rtv_historial_tarifario_tramite_id_tramite_historial_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_impronta') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rtv_impronta TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_impronta_impronta_id_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rtv_impronta_impronta_id_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_inspeccion') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rtv_inspeccion TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_inspeccion_equipo') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rtv_inspeccion_equipo TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_inspeccion_equipo_inspeccion_equipo_id_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rtv_inspeccion_equipo_inspeccion_equipo_id_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_inspeccion_inspeccion_id_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rtv_inspeccion_inspeccion_id_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_linea_equipo') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rtv_linea_equipo TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_linea_equipo_linea_equipo_id_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rtv_linea_equipo_linea_equipo_id_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_lineas') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rtv_lineas TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_lineas_lineaid_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rtv_lineas_lineaid_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_matricula') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rtv_matricula TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_matricula_id_matricula_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rtv_matricula_id_matricula_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_matriculacion_carga') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rtv_matriculacion_carga TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_matriculacion_carga_id_matriculacion_carga_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rtv_matriculacion_carga_id_matriculacion_carga_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_metodo_inspeccion') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rtv_metodo_inspeccion TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_metodo_inspeccion_metodoinspeccionid_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rtv_metodo_inspeccion_metodoinspeccionid_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_observacion_vehiculo_srv') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rtv_observacion_vehiculo_srv TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_observacion_vehiculo_srv_id_observacion_srv_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rtv_observacion_vehiculo_srv_id_observacion_srv_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_pago_inspeccion') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rtv_pago_inspeccion TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_pago_inspeccion_id_pago_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rtv_pago_inspeccion_id_pago_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_primera_matriculacion') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rtv_primera_matriculacion TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_primera_matriculacion_id_primera_matriculacion_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rtv_primera_matriculacion_id_primera_matriculacion_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_recargo_calendarizacion') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rtv_recargo_calendarizacion TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_recargo_calendarizacion_id_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rtv_recargo_calendarizacion_id_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_registro_base_unica_vehiculo') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rtv_registro_base_unica_vehiculo TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_registro_base_unica_vehiculo_id_registro_base_unica_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rtv_registro_base_unica_vehiculo_id_registro_base_unica_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_renovacion_anual') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rtv_renovacion_anual TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_renovacion_anual_id_renovacion_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rtv_renovacion_anual_id_renovacion_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_subfamilia') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rtv_subfamilia TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_subfamilia_subfamilia_id_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rtv_subfamilia_subfamilia_id_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_tarifario_tramite') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rtv_tarifario_tramite TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_tarifario_tramite_id_tarifario_tramite_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rtv_tarifario_tramite_id_tarifario_tramite_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_tipo_defecto') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rtv_tipo_defecto TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_tipo_defecto_tipo_defecto_id_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rtv_tipo_defecto_tipo_defecto_id_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_tramite_matriculacion') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rtv_tramite_matriculacion TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_tramite_matriculacion_id_tramite_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rtv_tramite_matriculacion_id_tramite_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_transferencia_dominio') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rtv_transferencia_dominio TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_transferencia_dominio_id_transferencia_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rtv_transferencia_dominio_id_transferencia_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_transferencia_dominio_srv') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rtv_transferencia_dominio_srv TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_transferencia_dominio_srv_id_transferencia_srv_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rtv_transferencia_dominio_srv_id_transferencia_srv_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_turnos') IS NOT NULL THEN
        GRANT ALL ON TABLE public.rtv_turnos TO rol_administrador;
    END IF;
    IF to_regclass('public.rtv_turnos_turno_id_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.rtv_turnos_turno_id_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.sri_consulta_validacion') IS NOT NULL THEN
        GRANT ALL ON TABLE public.sri_consulta_validacion TO rol_administrador;
    END IF;
    IF to_regclass('public.sri_consulta_validacion_id_consulta_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.sri_consulta_validacion_id_consulta_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.sri_impuesto_vehicular') IS NOT NULL THEN
        GRANT ALL ON TABLE public.sri_impuesto_vehicular TO rol_administrador;
    END IF;
    IF to_regclass('public.sri_impuesto_vehicular_id_impuesto_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.sri_impuesto_vehicular_id_impuesto_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.sri_registro_vehiculo') IS NOT NULL THEN
        GRANT ALL ON TABLE public.sri_registro_vehiculo TO rol_administrador;
    END IF;
    IF to_regclass('public.sri_registro_vehiculo_id_sri_registro_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.sri_registro_vehiculo_id_sri_registro_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.srtv_area') IS NOT NULL THEN
        GRANT ALL ON TABLE public.srtv_area TO rol_administrador;
    END IF;
    IF to_regclass('public.srtv_area_area_id_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.srtv_area_area_id_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.srtv_auditoria') IS NOT NULL THEN
        GRANT ALL ON TABLE public.srtv_auditoria TO rol_administrador;
    END IF;
    IF to_regclass('public.srtv_auditoria_auditoria_id_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.srtv_auditoria_auditoria_id_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.srtv_backup_config') IS NOT NULL THEN
        GRANT ALL ON TABLE public.srtv_backup_config TO rol_administrador;
    END IF;
    IF to_regclass('public.srtv_backup_config_config_id_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.srtv_backup_config_config_id_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.srtv_backup_notification') IS NOT NULL THEN
        GRANT ALL ON TABLE public.srtv_backup_notification TO rol_administrador;
    END IF;
    IF to_regclass('public.srtv_backup_notification_notification_id_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.srtv_backup_notification_notification_id_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.srtv_backup_record') IS NOT NULL THEN
        GRANT ALL ON TABLE public.srtv_backup_record TO rol_administrador;
    END IF;
    IF to_regclass('public.srtv_backup_record_record_id_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.srtv_backup_record_record_id_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.srtv_empresa') IS NOT NULL THEN
        GRANT ALL ON TABLE public.srtv_empresa TO rol_administrador;
    END IF;
    IF to_regclass('public.srtv_empresa_empresa_id_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.srtv_empresa_empresa_id_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.srtv_metodos_pago') IS NOT NULL THEN
        GRANT ALL ON TABLE public.srtv_metodos_pago TO rol_administrador;
    END IF;
    IF to_regclass('public.srtv_metodos_pago_metodo_pago_id_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.srtv_metodos_pago_metodo_pago_id_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.srtv_opcion_menu') IS NOT NULL THEN
        GRANT ALL ON TABLE public.srtv_opcion_menu TO rol_administrador;
    END IF;
    IF to_regclass('public.srtv_opcion_menu_opcion_menu_id_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.srtv_opcion_menu_opcion_menu_id_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.srtv_permiso') IS NOT NULL THEN
        GRANT ALL ON TABLE public.srtv_permiso TO rol_administrador;
    END IF;
    IF to_regclass('public.srtv_permiso_permiso_id_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.srtv_permiso_permiso_id_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.srtv_rol') IS NOT NULL THEN
        GRANT ALL ON TABLE public.srtv_rol TO rol_administrador;
    END IF;
    IF to_regclass('public.srtv_rol_opcion_menu') IS NOT NULL THEN
        GRANT ALL ON TABLE public.srtv_rol_opcion_menu TO rol_administrador;
    END IF;
    IF to_regclass('public.srtv_rol_opcion_menu_rol_opcion_menu_id_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.srtv_rol_opcion_menu_rol_opcion_menu_id_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.srtv_rol_permisos') IS NOT NULL THEN
        GRANT ALL ON TABLE public.srtv_rol_permisos TO rol_administrador;
    END IF;
    IF to_regclass('public.srtv_rol_rol_id_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.srtv_rol_rol_id_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.srtv_sesion_usuario') IS NOT NULL THEN
        GRANT ALL ON TABLE public.srtv_sesion_usuario TO rol_administrador;
    END IF;
    IF to_regclass('public.srtv_sesion_usuario_sesion_id_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.srtv_sesion_usuario_sesion_id_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.srtv_tipo_servicio') IS NOT NULL THEN
        GRANT ALL ON TABLE public.srtv_tipo_servicio TO rol_administrador;
    END IF;
    IF to_regclass('public.srtv_tipo_servicio_id_tipo_tramite_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.srtv_tipo_servicio_id_tipo_tramite_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.srtv_usuario') IS NOT NULL THEN
        GRANT ALL ON TABLE public.srtv_usuario TO rol_administrador;
    END IF;
    IF to_regclass('public.srtv_usuario_roles') IS NOT NULL THEN
        GRANT ALL ON TABLE public.srtv_usuario_roles TO rol_administrador;
    END IF;
    IF to_regclass('public.srtv_usuario_roles_usuario_rol_id_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.srtv_usuario_roles_usuario_rol_id_seq TO rol_administrador;
    END IF;
    IF to_regclass('public.srtv_usuario_usuario_id_seq') IS NOT NULL THEN
        GRANT ALL ON SEQUENCE public.srtv_usuario_usuario_id_seq TO rol_administrador;
    END IF;
END $$;
COMMIT;
