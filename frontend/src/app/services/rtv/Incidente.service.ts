import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Incidente {
  idIncidente?: number | null;
  tramiteId?: number | null;
  vehiculoId?: number | null;
  usuarioReportaId?: number | null;
  usuarioResuelveId?: number | null;
  entidadId: number | null;
  numeroIncidente: string;
  tipoIncidente: string;
  descripcion: string;
  documentosSoporte?: string | null;
  areaResponsable?: string | null;
  resolucion?: string | null;
  estado: string;
  fechaRegistro?: string;
  fechaResolucion?: string | null;
}

@Injectable({ providedIn: 'root' })
export class IncidenteService {
  private apiUrl = 'http://localhost:8080/api/incidentes';

  constructor(private http: HttpClient) {}

  listar(): Observable<Incidente[]> {
    return this.http.get<Incidente[]>(this.apiUrl);
  }

  crear(dto: Incidente): Observable<Incidente> {
    return this.http.post<Incidente>(this.apiUrl, dto);
  }

  actualizar(id: number, dto: Incidente): Observable<Incidente> {
    return this.http.put<Incidente>(`${this.apiUrl}/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
