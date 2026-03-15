-- =============================================================================
-- Script de datos de prueba para TABLAS DE BÚSQUEDA (catálogos) ANT
-- Base: PostgreSQL. Solo tablas catálogo sin FKs a tablas transaccionales.
-- Mínimo 30 INSERT por tabla. Datos coherentes y realistas (contexto Ecuador/ANT).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. ant_estado_multa (tipo_multa, descripcion, estado)
-- -----------------------------------------------------------------------------
INSERT INTO ant_estado_multa (tipo_multa, descripcion, estado) VALUES
('PENDIENTE_PAGO', 'Multa emitida y pendiente de pago', 'ACTIVO'),
('PAGADA', 'Multa cancelada en su totalidad', 'ACTIVO'),
('EN_CONVENIO', 'Incluida en convenio de pago', 'ACTIVO'),
('PRESCRITA', 'Multa prescrita por tiempo', 'ACTIVO'),
('EN_APELACION', 'En proceso de apelación', 'ACTIVO'),
('ANULADA', 'Multa anulada por resolución', 'ACTIVO'),
('REDIMIDA', 'Redimida con descuento o beneficio', 'ACTIVO'),
('PARCIALMENTE_PAGADA', 'Pago parcial realizado', 'ACTIVO'),
('EN_REFINANCIAMIENTO', 'Incluida en refinanciamiento', 'ACTIVO'),
('NOTIFICADA', 'Citación notificada al infractor', 'ACTIVO'),
('POR_NOTIFICAR', 'Pendiente de notificación', 'ACTIVO'),
('COBRANZA_JUDICIAL', 'En proceso de cobranza judicial', 'ACTIVO'),
('DESCUENTO_VOLUNTARIO', 'Aplicado descuento por pago voluntario', 'ACTIVO'),
('EXONERADA', 'Exonerada por resolución', 'ACTIVO'),
('EN_REVISION', 'En revisión por la entidad', 'ACTIVO'),
('CONVENIO_VIGENTE', 'Convenio de pago vigente', 'ACTIVO'),
('CONVENIO_VENCIDO', 'Convenio de pago vencido', 'ACTIVO'),
('MOROSA', 'Multa en mora', 'ACTIVO'),
('EN_EMBARGO', 'Sujeta a embargo', 'ACTIVO'),
('LEVANTADA', 'Multa levantada o cerrada', 'ACTIVO'),
('TRANSFERIDA', 'Transferida a otra entidad', 'ACTIVO'),
('EN_GRACIA', 'En período de gracia', 'ACTIVO'),
('CONTESTADA', 'Contestada por el infractor', 'ACTIVO'),
('REQUIERE_DOCUMENTO', 'Pendiente documentación', 'ACTIVO'),
('EN_AUDIENCIA', 'En proceso de audiencia', 'ACTIVO'),
('APELACION_ACOGIDA', 'Apelación acogida', 'ACTIVO'),
('APELACION_RECHAZADA', 'Apelación rechazada', 'ACTIVO'),
('PAGO_VERIFICADO', 'Pago verificado por entidad', 'ACTIVO'),
('EN_CONSULTA', 'En consulta con entidad emisora', 'ACTIVO'),
('SUSPENDIDA', 'Multa suspendida temporalmente', 'ACTIVO'),
('REINTEGRADA', 'Reintegrada tras revisión', 'ACTIVO');

-- -----------------------------------------------------------------------------
-- 2. ant_tipo_bloqueo (codigo, nombre, descripcion, doc_activacion, doc_desactivacion, inst_autorizada, estado)
-- -----------------------------------------------------------------------------
INSERT INTO ant_tipo_bloqueo (codigo, nombre, descripcion, doc_activacion, doc_desactivacion, inst_autorizada, estado) VALUES
('BA', 'Bloqueo Administrativo', 'Bloqueo por deuda administrativa ANT', 'Resolución ANT', 'Comprobante de pago', 'ANT', 'ACTIVO'),
('FA', 'Fallo Administrativo', 'Bloqueo por fallo en proceso administrativo', 'Resolución', 'Cumplimiento de resolución', 'ANT', 'ACTIVO'),
('COBY', 'Comisión por Cobro Coactivo', 'Bloqueo por comisión de cobro coactivo', 'Mandamiento', 'Pago total', 'ANT', 'ACTIVO'),
('TDD', 'Tasa por Deuda de Dominio', 'Bloqueo por deuda de dominio vehicular', 'Resolución', 'Comprobante pago dominio', 'ANT', 'ACTIVO'),
('RDD', 'Retención Dominio', 'Retención por dominio', 'Resolución', 'Liberación dominio', 'ANT', 'ACTIVO'),
('ROBO', 'Robo Reportado', 'Vehículo reportado como robado', 'Denuncia policial', 'Levantamiento policial', 'Policía/ANT', 'ACTIVO'),
('PRENDA_COMERCIAL', 'Prenda Comercial', 'Prenda por crédito comercial', 'Contrato prendario', 'Liberación prendaria', 'Institución financiera', 'ACTIVO'),
('PRENDA_INDUSTRIAL', 'Prenda Industrial', 'Prenda industrial registrada', 'Contrato', 'Liberación', 'Institución financiera', 'ACTIVO'),
('EMBARGO_JUDICIAL', 'Embargo Judicial', 'Embargo por orden judicial', 'Auto judicial', 'Levantamiento judicial', 'Poder Judicial', 'ACTIVO'),
('MEDIDA_CAUTELAR', 'Medida Cautelar', 'Bloqueo por medida cautelar', 'Resolución judicial', 'Levantamiento', 'Poder Judicial', 'ACTIVO'),
('DEUDA_MATRICULACION', 'Deuda Matriculación', 'Bloqueo por deuda de matriculación', 'Resolución ANT', 'Pago matriculación', 'ANT', 'ACTIVO'),
('MULTA_TRANSITO', 'Multa Tránsito', 'Bloqueo por multas de tránsito', 'Citaciones', 'Comprobantes pago', 'GAD/ANT', 'ACTIVO'),
('IMPUESTO_VEHICULAR', 'Impuesto Vehicular', 'Bloqueo por impuesto vehicular', 'Resolución', 'Pago impuesto', 'SRI/Municipio', 'ACTIVO'),
('LEASING', 'Leasing', 'Bloqueo por contrato de leasing', 'Contrato leasing', 'Fin contrato', 'Empresa leasing', 'ACTIVO'),
('CREDITO_TAXI', 'Crédito Taxi', 'Bloqueo por crédito de taxi', 'Contrato', 'Cancelación', 'Institución', 'ACTIVO'),
('SUBSIDIO_COMBUSTIBLE', 'Subsidio Combustible', 'Bloqueo por irregularidad subsidio', 'Resolución', 'Regularización', 'Ministerio', 'ACTIVO'),
('ADUANERO', 'Bloqueo Aduanero', 'Retención aduanera', 'Resolución aduanera', 'Liberación aduanera', 'SENAE', 'ACTIVO'),
('FISCAL', 'Bloqueo Fiscal', 'Bloqueo por deuda tributaria', 'Resolución SRI', 'Pago SRI', 'SRI', 'ACTIVO'),
('LABORAL', 'Bloqueo Laboral', 'Embargo por deuda laboral', 'Resolución laboral', 'Pago/Cumplimiento', 'Ministerio Trabajo', 'ACTIVO'),
('ALIMENTOS', 'Pensión Alimentos', 'Bloqueo por pensión de alimentos', 'Resolución judicial', 'Levantamiento', 'Poder Judicial', 'ACTIVO'),
('INCOBRABLE', 'Deuda Incobrable', 'Bloqueo por deuda declarada incobrable', 'Resolución', 'Pago excepcional', 'ANT', 'ACTIVO'),
('CONVENIO_VENCIDO', 'Convenio Vencido', 'Bloqueo por convenio vencido', 'Convenio', 'Pago total', 'ANT', 'ACTIVO'),
('RENOVACION_PENDIENTE', 'Renovación Pendiente', 'Bloqueo por no renovación a tiempo', 'Calendario', 'Renovación', 'ANT', 'ACTIVO'),
('DOCUMENTACION', 'Documentación Incompleta', 'Bloqueo por documentación faltante', 'Requerimiento', 'Documentos', 'ANT', 'ACTIVO'),
('HURTO', 'Hurto', 'Vehículo reportado en hurto', 'Denuncia', 'Levantamiento', 'Policía', 'ACTIVO'),
('EXPORTACION', 'Exportación', 'Bloqueo por exportación no regularizada', 'Resolución', 'Regularización', 'ANT', 'ACTIVO'),
('TRANSFERENCIA', 'Transferencia Pendiente', 'Bloqueo por transferencia no concluida', 'Solicitud', 'Transferencia', 'ANT', 'ACTIVO'),
('INCONSISTENCIA', 'Inconsistencia Registral', 'Bloqueo por inconsistencia en registro', 'Informe', 'Corrección', 'ANT', 'ACTIVO'),
('REVISION_TECNICA', 'Revisión Técnica', 'Bloqueo por revisión técnica vencida', 'Calendario RTV', 'Certificado RTV', 'ANT', 'ACTIVO'),
('SEGURO_OBLIGATORIO', 'SOAT', 'Bloqueo por SOAT vencido', 'Póliza', 'SOAT vigente', 'ANT', 'ACTIVO'),
('OTRO', 'Otro Bloqueo', 'Otro tipo de bloqueo registrado', 'Según caso', 'Según caso', 'Variable', 'ACTIVO');

-- -----------------------------------------------------------------------------
-- 3. ant_tipo_deuda_vehicular (codigo, nombre, descripcion, estado)
-- -----------------------------------------------------------------------------
INSERT INTO ant_tipo_deuda_vehicular (codigo, nombre, descripcion, estado) VALUES
('MULTA_TRANSITO', 'Multa de Tránsito', 'Multas por infracciones de tránsito', 'ACTIVO'),
('MULTA_MATRICULACION', 'Multa por Matriculación', 'Multas por no renovar matriculación', 'ACTIVO'),
('IMPUESTO_VEHICULAR', 'Impuesto Vehicular', 'Deuda por impuesto vehicular', 'ACTIVO'),
('TASA_DOMINIO', 'Tasa de Dominio', 'Tasa por trámite de dominio', 'ACTIVO'),
('RENTA_MATRICULACION', 'Renta de Matriculación', 'Derecho anual de matriculación', 'ACTIVO'),
('MULTA_CALENDARIZACION', 'Multa Calendarización', 'Multa por no respetar calendario de placas', 'ACTIVO'),
('COBRO_COACTIVO', 'Cobro Coactivo', 'Gastos de cobranza coactiva', 'ACTIVO'),
('INTERESES_MORA', 'Intereses de Mora', 'Intereses por pago extemporáneo', 'ACTIVO'),
('RETASAS', 'Retasas', 'Recargos y retasas administrativas', 'ACTIVO'),
('TRAMITE_EXTEMPORANEO', 'Trámite Extemporáneo', 'Recargo por trámite fuera de fecha', 'ACTIVO'),
('TRANSFERENCIA', 'Transferencia de Propiedad', 'Derechos por transferencia', 'ACTIVO'),
('DUPLICADO_PLACA', 'Duplicado de Placa', 'Costo por duplicado de placa', 'ACTIVO'),
('CERTIFICADO', 'Certificados', 'Emisión de certificados', 'ACTIVO'),
('PRENDA', 'Registro de Prenda', 'Derechos por registro prendario', 'ACTIVO'),
('LEVANTAMIENTO_PRENDA', 'Levantamiento Prenda', 'Trámite de levantamiento de prenda', 'ACTIVO'),
('RADICACION', 'Radicación', 'Costo de radicación vehicular', 'ACTIVO'),
('BAJA', 'Baja de Vehículo', 'Trámite de baja definitiva', 'ACTIVO'),
('INSCRIPCION_INICIAL', 'Inscripción Inicial', 'Primera inscripción en registro', 'ACTIVO'),
('RENOVACION', 'Renovación Anual', 'Derecho de renovación', 'ACTIVO'),
('HISTORIAL', 'Consulta Historial', 'Pago por consulta de historial', 'ACTIVO'),
('MULTA_EMISION', 'Multa por Emisión', 'Multas por emisión de documentos', 'ACTIVO'),
('CONVENIO_QUIEBRA', 'Convenio Incumplido', 'Saldo por convenio incumplido', 'ACTIVO'),
('OTROS_GASTOS', 'Otros Gastos', 'Otros gastos administrativos', 'ACTIVO'),
('MULTA_RTV', 'Multa RTV', 'Multa por revisión técnica vencida', 'ACTIVO'),
('SOAT_DEUDA', 'SOAT', 'Deuda por seguro obligatorio', 'ACTIVO'),
('EXONERACION_REVOCADA', 'Exoneración Revocada', 'Deuda por exoneración revocada', 'ACTIVO'),
('DEVOLUCION_PLACA', 'Devolución Placa', 'Costo por devolución de placa', 'ACTIVO'),
('CAMBIO_CARACTERISTICAS', 'Cambio Características', 'Trámite cambio de características', 'ACTIVO'),
('HOMOLOGACION', 'Homologación', 'Derechos por homologación', 'ACTIVO'),
('INSPECCION', 'Inspección', 'Costo de inspección técnica', 'ACTIVO'),
('MULTA_ADMINISTRATIVA', 'Multa Administrativa', 'Multas administrativas varias', 'ACTIVO'),
('RECARGO_PRESCRIPCION', 'Recargo Prescripción', 'Recargo por prescripción', 'ACTIVO');

-- -----------------------------------------------------------------------------
-- 4. ant_estado_excepcion (codigo, descripcion, finaliza, estado)
-- -----------------------------------------------------------------------------
INSERT INTO ant_estado_excepcion (codigo, descripcion, finaliza, estado) VALUES
('ROBO', 'Vehículo reportado en robo', 'LEVANTAMIENTO_ROBO', 'ACTIVO'),
('DAÑO_GRAVE', 'Vehículo con daño grave que impide circulación', 'REPARACION', 'ACTIVO'),
('FUERZA_MAYOR', 'Caso fortuito o fuerza mayor', 'VERIFICACION', 'ACTIVO'),
('CONCESIONARIA', 'Vehículo en concesionaria en garantía', 'RETIRO', 'ACTIVO'),
('PROCESO_JUDICIAL', 'Vehículo sujeto a proceso judicial', 'SENTENCIA', 'ACTIVO'),
('TALLER_MECANICO', 'Vehículo en taller por reparación', 'ALTA_TALLER', 'ACTIVO'),
('ACCIDENTE', 'Vehículo accidentado en reparación', 'REPARACION', 'ACTIVO'),
('INCAUTACION', 'Vehículo incautado', 'DEVOLUCION', 'ACTIVO'),
('SECUESTRO', 'Vehículo secuestrado', 'LEVANTAMIENTO', 'ACTIVO'),
('EMBARGO', 'Vehículo embargado', 'LEVANTAMIENTO_EMBARGO', 'ACTIVO'),
('SECTOR_PUBLICO', 'Vehículo de institución pública', 'TRANSFERENCIA', 'ACTIVO'),
('DIPLOMATICO', 'Vehículo con inmunidad diplomática', 'RETIRO_PAIS', 'ACTIVO'),
('INTERNACION_TEMPORAL', 'Vehículo en internación temporal', 'SALIDA', 'ACTIVO'),
('MENAJE', 'Mudanza o menaje de casa', 'REGULARIZACION', 'ACTIVO'),
('DISCAPACIDAD', 'Excepción por discapacidad', 'RENOVACION', 'ACTIVO'),
('ESTUDIO_TECNICO', 'En estudio técnico por la ANT', 'RESOLUCION', 'ACTIVO'),
('APELACION', 'Excepción en apelación', 'RESOLUCION_APELACION', 'ACTIVO'),
('AUDIENCIA', 'Pendiente de audiencia', 'RESOLUCION_AUDIENCIA', 'ACTIVO'),
('DOCUMENTACION', 'Pendiente documentación adicional', 'RECEPCION_DOCS', 'ACTIVO'),
('REVISION_JURIDICA', 'En revisión jurídica', 'DICTAMEN', 'ACTIVO'),
('FUERZA_MAYOR_CLIMA', 'Desastre natural o emergencia climática', 'NORMALIZACION', 'ACTIVO'),
('COVID', 'Excepción por pandemia o emergencia sanitaria', 'FIN_EMERGENCIA', 'ACTIVO'),
('PROBLEMA_ENTIDAD', 'Fallo o demora de la entidad', 'SOLUCION_ENTIDAD', 'ACTIVO'),
('RETRASO_MINISTERIO', 'Retraso por trámite ministerial', 'RESPUESTA_MINISTERIO', 'ACTIVO'),
('ENTREGA_INTERINSTITUCIONAL', 'Entrega entre instituciones públicas', 'RECEPCION', 'ACTIVO'),
('INCAUTACION_JUDICIAL', 'Incautación por orden judicial', 'DEVOLUCION_JUDICIAL', 'ACTIVO'),
('HURTO_VEHICULO', 'Vehículo reportado en hurto', 'RECUPERACION', 'ACTIVO'),
('GARANTIA_FABRICA', 'En garantía de fábrica', 'FIN_GARANTIA', 'ACTIVO'),
('PRUEBA_TECNICA', 'En prueba técnica o homologación', 'APROBACION', 'ACTIVO'),
('EXHIBICION', 'Vehículo en exhibición autorizada', 'RETIRO_EXHIBICION', 'ACTIVO'),
('REPARACION_OFICIAL', 'En reparación en taller oficial', 'ENTREGA', 'ACTIVO'),
('TRAMITE_EXTRANJERO', 'Trámite en curso en país de origen', 'REGULARIZACION', 'ACTIVO'),
('OTRO', 'Otra causal de excepción', 'SEGUN_CAUSAL', 'ACTIVO');

-- -----------------------------------------------------------------------------
-- 5. ant_entidad_transito (codigo, nombre, nivel, descripcion, estado)
-- -----------------------------------------------------------------------------
INSERT INTO ant_entidad_transito (codigo, nombre, nivel, descripcion, estado) VALUES
('ANT', 'Agencia Nacional de Tránsito', 'NACIONAL', 'Ente rector del tránsito a nivel nacional', 'ACTIVO'),
('GADMQ', 'Municipio de Quito', 'CANTONAL', 'Dirección de Movilidad del DMQ', 'ACTIVO'),
('GADMG', 'Municipio de Guayaquil', 'CANTONAL', 'Autoridad de Tránsito de Guayaquil', 'ACTIVO'),
('GADMC', 'Municipio de Cuenca', 'CANTONAL', 'Movilidad del GAD Cuenca', 'ACTIVO'),
('GADMS', 'Municipio de Santo Domingo', 'CANTONAL', 'Comisión de Tránsito Santo Domingo', 'ACTIVO'),
('GADMM', 'Municipio de Machala', 'CANTONAL', 'Tránsito del GAD Machala', 'ACTIVO'),
('GADMD', 'Municipio de Durán', 'CANTONAL', 'Tránsito Durán', 'ACTIVO'),
('GADML', 'Municipio de Loja', 'CANTONAL', 'Movilidad GAD Loja', 'ACTIVO'),
('GADMMB', 'Municipio de Manta', 'CANTONAL', 'Tránsito Manta', 'ACTIVO'),
('GADMP', 'Municipio de Portoviejo', 'CANTONAL', 'Tránsito Portoviejo', 'ACTIVO'),
('GADMR', 'Municipio de Riobamba', 'CANTONAL', 'Movilidad Riobamba', 'ACTIVO'),
('GADMIB', 'Municipio de Ibarra', 'CANTONAL', 'Tránsito Ibarra', 'ACTIVO'),
('GADMES', 'Municipio de Esmeraldas', 'CANTONAL', 'Tránsito Esmeraldas', 'ACTIVO'),
('GADMAM', 'Municipio de Ambato', 'CANTONAL', 'Movilidad Ambato', 'ACTIVO'),
('GADMQE', 'Municipio de Quevedo', 'CANTONAL', 'Tránsito Quevedo', 'ACTIVO'),
('GADMTU', 'Municipio de Tulcán', 'CANTONAL', 'Tránsito Tulcán', 'ACTIVO'),
('GADMLA', 'Municipio de Latacunga', 'CANTONAL', 'Movilidad Latacunga', 'ACTIVO'),
('GADMBB', 'Municipio de Babahoyo', 'CANTONAL', 'Tránsito Babahoyo', 'ACTIVO'),
('GADMDA', 'Municipio de Daule', 'CANTONAL', 'Tránsito Daule', 'ACTIVO'),
('GADMSC', 'Municipio de Santa Elena', 'CANTONAL', 'Tránsito Santa Elena', 'ACTIVO'),
('GADMEC', 'Municipio de El Carmen', 'CANTONAL', 'Tránsito El Carmen', 'ACTIVO'),
('GADMJA', 'Municipio de Jaramijó', 'CANTONAL', 'Tránsito Jaramijó', 'ACTIVO'),
('GADMCC', 'Municipio de La Concordia', 'CANTONAL', 'Tránsito La Concordia', 'ACTIVO'),
('GADMVE', 'Municipio de Ventanas', 'CANTONAL', 'Tránsito Ventanas', 'ACTIVO'),
('GADMCH', 'Municipio de Chone', 'CANTONAL', 'Tránsito Chone', 'ACTIVO'),
('GADMTA', 'Municipio de Tacando', 'CANTONAL', 'Tránsito Tacando', 'ACTIVO'),
('GADMPA', 'Municipio de Pasaje', 'CANTONAL', 'Tránsito Pasaje', 'ACTIVO'),
('GADMZA', 'Municipio de Zamora', 'CANTONAL', 'Tránsito Zamora', 'ACTIVO'),
('GADMOT', 'Municipio de Otavalo', 'CANTONAL', 'Tránsito Otavalo', 'ACTIVO'),
('GADMCO', 'Municipio de Cotacachi', 'CANTONAL', 'Tránsito Cotacachi', 'ACTIVO'),
('GADMPU', 'Municipio de Puyo', 'CANTONAL', 'Tránsito Puyo', 'ACTIVO'),
('GADMTE', 'Municipio de Tena', 'CANTONAL', 'Tránsito Tena', 'ACTIVO'),
('GADMFR', 'Municipio de Francisco de Orellana', 'CANTONAL', 'Tránsito Coca', 'ACTIVO'),
('GADMNY', 'Municipio de Nueva Loja', 'CANTONAL', 'Tránsito Lago Agrio', 'ACTIVO');

-- -----------------------------------------------------------------------------
-- 6. ant_calendarizacion_matriculacion (ultimo_digito_placa, mes, tipo, estado)
--    tipo: 1 = primera matriculación, 2 = renovación anual
--    ultimo_digito_placa: 0-9; mes: 1-12
-- -----------------------------------------------------------------------------
INSERT INTO ant_calendarizacion_matriculacion (ultimo_digito_placa, mes, tipo, estado) VALUES
(0, 1, 1, 'ACTIVO'),
(1, 2, 1, 'ACTIVO'),
(2, 3, 1, 'ACTIVO'),
(3, 4, 1, 'ACTIVO'),
(4, 5, 1, 'ACTIVO'),
(5, 6, 1, 'ACTIVO'),
(6, 7, 1, 'ACTIVO'),
(7, 8, 1, 'ACTIVO'),
(8, 9, 1, 'ACTIVO'),
(9, 10, 1, 'ACTIVO'),
(0, 11, 1, 'ACTIVO'),
(1, 12, 1, 'ACTIVO'),
(2, 1, 2, 'ACTIVO'),
(3, 2, 2, 'ACTIVO'),
(4, 3, 2, 'ACTIVO'),
(5, 4, 2, 'ACTIVO'),
(6, 5, 2, 'ACTIVO'),
(7, 6, 2, 'ACTIVO'),
(8, 7, 2, 'ACTIVO'),
(9, 8, 2, 'ACTIVO'),
(0, 9, 2, 'ACTIVO'),
(1, 10, 2, 'ACTIVO'),
(2, 11, 2, 'ACTIVO'),
(3, 12, 2, 'ACTIVO'),
(4, 1, 1, 'ACTIVO'),
(5, 2, 1, 'ACTIVO'),
(6, 3, 1, 'ACTIVO'),
(7, 4, 1, 'ACTIVO'),
(8, 5, 1, 'ACTIVO'),
(9, 6, 1, 'ACTIVO'),
(0, 7, 2, 'ACTIVO'),
(1, 8, 2, 'ACTIVO'),
(2, 9, 2, 'ACTIVO'),
(3, 10, 2, 'ACTIVO'),
(4, 11, 2, 'ACTIVO'),
(5, 12, 2, 'ACTIVO');

-- =============================================================================
-- FIN script tablas de búsqueda ANT
-- =============================================================================
