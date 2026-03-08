import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TipoBloqueo {
  idTipoBloqueo: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  docActivacion?: string;
  docDesactivacion?: string;
  instAutorizada?: string;
  estado: string;
}

@Injectable({ providedIn: 'root' })
export class TipoBloqueoService {
  private apiUrl = 'http://localhost:8080/api/tipos-bloqueo';

  constructor(private http: HttpClient) {}

  listar(): Observable<TipoBloqueo[]> {
    return this.http.get<TipoBloqueo[]>(this.apiUrl);
  }

  listarInstituciones(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/instituciones`);
  }

  obtenerPorId(id: number): Observable<TipoBloqueo> {
    return this.http.get<TipoBloqueo>(`${this.apiUrl}/${id}`);
  }
}
