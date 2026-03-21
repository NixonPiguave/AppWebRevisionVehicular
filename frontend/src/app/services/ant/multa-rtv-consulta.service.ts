import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MultaRtvResumenFila {
  vehiculoId: number;
  propietarioId: number;
  propietarioNombre: string;
  propietarioDocumento: string;
  vehiculoPlaca: string;
  vehiculoMarcaModelo: string;
  recargoAcumulado: number;
}

export interface PropietarioVista {
  idPropietario: number;
  documentoIdentidad: string;
  nombre: string;
  telefono?: string;
  correo?: string;
  direccion?: string;
  fechaRegistro?: string;
}

export interface VehiculoVista {
  vehiculoId: number;
  matricula: string;
  chasis?: string;
  vin?: string;
  codigoMotor?: string;
  anioFabricacion?: number;
  marcaNombre?: string;
  modeloNombre?: string;
}

export interface MultaTablaCompleta {
  idMulta: number;
  idEntidad?: number;
  entidadNombre?: string;
  idPropietario?: number;
  idVehiculo?: number;
  idEstadoMulta?: number;
  estadoMultaTipo?: string;
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
  propietario: PropietarioVista | null;
  vehiculo: VehiculoVista | null;
  multas: MultaTablaCompleta[];
}

@Injectable({ providedIn: 'root' })
export class MultaRtvConsultaService {
  private apiUrl = 'http://localhost:8080/api/multa';

  constructor(private http: HttpClient) {}

  listarResumen(): Observable<MultaRtvResumenFila[]> {
    return this.http.get<MultaRtvResumenFila[]>(`${this.apiUrl}/consulta-rtv-anual/resumen`);
  }

  obtenerDetalle(vehiculoId: number): Observable<MultaRtvDetalleCompleto> {
    return this.http.get<MultaRtvDetalleCompleto>(
      `${this.apiUrl}/consulta-rtv-anual/vehiculo/${vehiculoId}`
    );
  }
}
