export interface BajaVehiculo {
  idBaja?: number;

  tramiteId: number;
  vehiculoId: number;
  propietarioId: number;
  entidadId: number;
  usuarioId: number;

  numeroTramite: string;
  motivoBaja: string;
  descripcionMotivo: string;

  inspeccion1Id?: number;
  inspeccion2Id?: number;
  inspeccion3Id?: number;

  empresaChatarrizado?: string;
  certChatarrizado?: string;
  fechaChatarrizado?: string;

  ordenJudicial?: string;
  constanciaPolicial?: string;

  notificadoSri: string;
  fechaNotificacionSri?: string;

  estado: string;
  fechaSolicitud: string;
  fechaConclusion?: string;
}

