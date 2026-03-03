export interface Turnos {
  turnoId?: number;
  propietarioId: number;
  vehiculoId: number;
  servicioId: number;
  tramiteId?: number;
  entidadId?: number;
  fechaInicio: string;
  fechaFin?: string;
  fechaCancelado?: string;
  estado: string;
}
