import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  listarTodas(): Observable<AuditoriaRegistro[]> {
    return this.http.get<AuditoriaRegistro[]>(this.apiUrl);
  }

  listarPorUsuario(usuarioId: number): Observable<AuditoriaRegistro[]> {
    return this.http.get<AuditoriaRegistro[]>(`${this.apiUrl}/usuario/${usuarioId}`);
  }

  listarPorRol(rolId: number): Observable<AuditoriaRegistro[]> {
    return this.http.get<AuditoriaRegistro[]>(`${this.apiUrl}/rol/${rolId}`);
  }
}
