import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RegistroObservacion {
  idObservacionSrv?: number | null;
  tramiteId?: number | null;
  vehiculoId: number | null;
  entidadId: number | null;
  usuarioId?: number | null;
  numeroTramite: string;
  tipoObservacion: string;
  descripcion: string;
  documentoSoporte: string;
  generaBloqueoCoby: string;
  estado: string;
  fechaRegistro?: string;
  fechaLevantamiento?: string | null;
  motivoLevantamiento?: string | null;
}

@Injectable({ providedIn: 'root' })
export class RegistroObservacionService {
  private apiUrl = 'http://localhost:8080/api/registro-observaciones';

  constructor(private http: HttpClient) {}

  listar(): Observable<RegistroObservacion[]> {
    return this.http.get<RegistroObservacion[]>(this.apiUrl);
  }

  crear(dto: RegistroObservacion): Observable<RegistroObservacion> {
    return this.http.post<RegistroObservacion>(this.apiUrl, dto);
  }

  actualizar(id: number, dto: RegistroObservacion): Observable<RegistroObservacion> {
    return this.http.put<RegistroObservacion>(`${this.apiUrl}/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
