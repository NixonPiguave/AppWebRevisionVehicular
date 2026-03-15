import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AuditoriaRegistro {
  auditoriaId: number;
  accion: string;
  tipoAccion: string;
  entidad: string;
  detalle: string;
  fecha: string;
  usuarioId: number;
  nombreUsuario: string;
  nombreCompleto: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuditoriaService {
  private apiUrl = 'http://localhost:8080/api/auditoria';

  constructor(private http: HttpClient) {}

  listarTodas(tipoAccion?: string): Observable<AuditoriaRegistro[]> {
    let params = new HttpParams();
    if (tipoAccion?.trim()) params = params.set('tipoAccion', tipoAccion.trim());
    return this.http.get<AuditoriaRegistro[]>(this.apiUrl, { params });
  }

  listarPorUsuario(usuarioId: number, tipoAccion?: string): Observable<AuditoriaRegistro[]> {
    let params = new HttpParams();
    if (tipoAccion?.trim()) params = params.set('tipoAccion', tipoAccion.trim());
    return this.http.get<AuditoriaRegistro[]>(`${this.apiUrl}/usuario/${usuarioId}`, { params });
  }

  listarPorRol(rolId: number, tipoAccion?: string): Observable<AuditoriaRegistro[]> {
    let params = new HttpParams();
    if (tipoAccion?.trim()) params = params.set('tipoAccion', tipoAccion.trim());
    return this.http.get<AuditoriaRegistro[]>(`${this.apiUrl}/rol/${rolId}`, { params });
  }
}
