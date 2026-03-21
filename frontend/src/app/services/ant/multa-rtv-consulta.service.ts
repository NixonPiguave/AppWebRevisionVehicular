import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MultaRtvResumenFila {
  vehiculoId: number;
  propietarioId: number;
  recargoAcumulado: number;
}

export interface MultaRtvDetalleLinea {
  idMulta: number;
  idEntidadTransito?: number;
  entidadNombre?: string;
  idEstadoMulta?: number;
  estadoMultaDescripcion?: string;
  numeroCitacion?: string;
  fechaEmision?: string;
  fechaNotificacion?: string;
  pais?: string;
  ciudad?: string;
  puntos?: string;
  motivo?: string;
  monto?: number;
  estado?: string;
}

export interface MultaRtvDetalleCompleto {
  vehiculoId: number;
  placa?: string;
  propietarioId?: number;
  propietarioDocumento?: string;
  propietarioNombre?: string;
  multas: MultaRtvDetalleLinea[];
}

@Injectable({ providedIn: 'root' })
export class MultaRtvConsultaService {
  private readonly base = 'http://localhost:8080/api/multa/consulta-rtv-anual';

  constructor(private http: HttpClient) {}

  listarResumen(): Observable<MultaRtvResumenFila[]> {
    return this.http.get<MultaRtvResumenFila[]>(`${this.base}/resumen`);
  }

  obtenerDetallePorVehiculo(vehiculoId: number): Observable<MultaRtvDetalleCompleto> {
    return this.http.get<MultaRtvDetalleCompleto>(`${this.base}/vehiculo/${vehiculoId}`);
  }
}
