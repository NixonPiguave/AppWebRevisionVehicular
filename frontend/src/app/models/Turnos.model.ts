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
  fechaPagado?: string;
  estado: string;
  montoPagado?: number;

  // Enriquecido para UI (evita mostrar IDs en tablas)
  propietarioNombre?: string;
  vehiculoDescripcion?: string;
}
