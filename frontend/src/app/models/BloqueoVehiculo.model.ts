export interface BloqueoVehiculo {
  idBloqueoSrv?: number;

  tramiteId: number;
  vehiculoId: number;
  entidadId: number;
  usuarioActivaId: number;

  numeroTramite: string;
  tipoBloqueoId: number;
  motivo: string;
  procesosBloqueados: string;
  documentoHabilitante: string;
  institucionOrigen: string;

  fechaActivacion: string;
  estado: string;
  observaciones?: string;
}

