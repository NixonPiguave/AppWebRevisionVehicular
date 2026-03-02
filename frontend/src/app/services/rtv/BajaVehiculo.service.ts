import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BajaVehiculo {
  idBaja?: number | null;
  tramiteId: number | null;
  vehiculoId: number | null;
  propietarioId: number | null;
  entidadId: number | null;
  usuarioId: number | null;
  numeroTramite: string;
  motivoBaja: string;
  descripcionMotivo: string;
  inspeccion1Id: number | null;
  inspeccion2Id: number | null;
  inspeccion3Id: number | null;
  empresaChatarrizado: string;
  certChatarrizado: string;
  fechaChatarrizado: string;
  ordenJudicial: string;
  constanciaPolicial: string;
  notificadoSri: string;
  fechaNotificacionSri: string;
  estado: string;
  fechaSolicitud: string;
  fechaConclusion: string;
}

@Injectable({ providedIn: 'root' })
export class BajaVehiculoService {
  private apiUrl = 'http://localhost:8080/api/bajas-vehiculo';

  constructor(private http: HttpClient) {}

  listar(): Observable<BajaVehiculo[]> {
    return this.http.get<BajaVehiculo[]>(this.apiUrl);
  }

  crear(dto: BajaVehiculo): Observable<BajaVehiculo> {
    return this.http.post<BajaVehiculo>(this.apiUrl, dto);
  }

  actualizar(id: number, dto: BajaVehiculo): Observable<BajaVehiculo> {
    return this.http.put<BajaVehiculo>(`${this.apiUrl}/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
