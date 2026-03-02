export interface DesbloqueoVehiculo {
  idDesbloqueo?: number;

  tramiteId: number;
  bloqueoId: number;
  vehiculoId: number;
  entidadId: number;
  usuarioDesactivaId: number;

  numeroTramite: string;
  documentoLevantamiento: string;
  motivoLevantamiento: string;

  fechaDesactivacion: string;
  estado: string;
}

