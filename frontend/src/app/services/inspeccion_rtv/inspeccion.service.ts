import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface InspeccionCrear {
  vehiculoId: number;
  metodoInspeccionId: number;
  lineaId?: number;
  usuarioId: number;
  observaciones?: string;
  ubicacionesRevisadas?: string[];
  defectosIds: number[];
}

export interface Inspeccion {
  id?: number;
  fechaInspeccion?: string;
  resultado: string;
  observaciones?: string;
  estado: string;
  vehiculoId: number;
  metodoInspeccionId: number;
  lineaId?: number;
  usuarioId: number;
  detalles?: DetalleInspeccion[];
}

export interface DetalleInspeccion {
  id?: number;
  inspeccionId?: number;
  defectoId: number;
  observacion?: string;
  estado: string;
  umbralId: number;
  metodoInspeccionId: number;
}

@Injectable({
  providedIn: 'root'
})
export class InspeccionService {

  private apiUrl = 'http://localhost:8080/api/inspecciones';

  constructor(private http: HttpClient) {}

  crear(inspeccion: InspeccionCrear): Observable<Inspeccion> {
    return this.http.post<Inspeccion>(this.apiUrl, inspeccion);
  }

  listar(): Observable<Inspeccion[]> {
    return this.http.get<Inspeccion[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<Inspeccion> {
    return this.http.get<Inspeccion>(`${this.apiUrl}/${id}`);
  }
}
