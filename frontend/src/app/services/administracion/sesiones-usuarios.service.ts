import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SesionUsuarioDTO {
  sesionId: number;
  usuarioId: number;
  usuario: string;
  nombreCompleto: string;
  rol: string;
  fechaLogin: string;
  ultimaActividad: string;
}

@Injectable({
  providedIn: 'root'
})
export class SesionesUsuariosService {
  private apiUrl = 'http://localhost:8080/api/sesiones-usuarios';

  constructor(private http: HttpClient) {}

  listarActivas(): Observable<SesionUsuarioDTO[]> {
    return this.http.get<SesionUsuarioDTO[]>(`${this.apiUrl}/activos`);
  }

  cerrarSesion(sesionId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${sesionId}/cerrar`, {});
  }
}
