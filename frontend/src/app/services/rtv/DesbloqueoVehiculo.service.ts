import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DesbloqueoVehiculo {
  idDesbloqueo?: number | null;
  tramiteId: number | null;
  bloqueoId: number | null;
  vehiculoId: number | null;
  entidadId: number | null;
  usuarioDesactivaId: number | null;
  numeroTramite: string;
  documentoLevantamiento: string;
  motivoLevantamiento: string;
  fechaDesactivacion: string;
  estado: string;
}

@Injectable({ providedIn: 'root' })
export class DesbloqueoVehiculoService {
  private apiUrl = 'http://localhost:8080/api/desbloqueos-vehiculo';

  constructor(private http: HttpClient) {}

  listar(): Observable<DesbloqueoVehiculo[]> {
    return this.http.get<DesbloqueoVehiculo[]>(this.apiUrl);
  }

  crear(dto: DesbloqueoVehiculo): Observable<DesbloqueoVehiculo> {
    return this.http.post<DesbloqueoVehiculo>(this.apiUrl, dto);
  }

  actualizar(id: number, dto: DesbloqueoVehiculo): Observable<DesbloqueoVehiculo> {
    return this.http.put<DesbloqueoVehiculo>(`${this.apiUrl}/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
