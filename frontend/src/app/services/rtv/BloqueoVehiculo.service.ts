import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BloqueoVehiculo {
  idBloqueoSrv?: number | null;
  vehiculoId: number | null;
  entidadId: number | null;
  usuarioActivaId: number | null;
  numeroTramite: string;
  tipoBloqueoId: number | null;
  motivo: string;
  procesosBloqueados: string;
  documentoHabilitante: string;
  institucionOrigen: string;
  fechaActivacion: string;
  estado: string;
  observaciones: string;
}

@Injectable({ providedIn: 'root' })
export class BloqueoVehiculoService {
  private apiUrl = 'http://localhost:8080/api/bloqueos-vehiculo';

  constructor(private http: HttpClient) {}

  listar(): Observable<BloqueoVehiculo[]> {
    return this.http.get<BloqueoVehiculo[]>(this.apiUrl);
  }

  crear(dto: BloqueoVehiculo): Observable<BloqueoVehiculo> {
    return this.http.post<BloqueoVehiculo>(this.apiUrl, dto);
  }

  actualizar(id: number, dto: BloqueoVehiculo): Observable<BloqueoVehiculo> {
    return this.http.put<BloqueoVehiculo>(`${this.apiUrl}/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
