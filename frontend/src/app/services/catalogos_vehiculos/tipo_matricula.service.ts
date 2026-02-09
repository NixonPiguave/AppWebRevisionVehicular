import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TipoMatricula {
  id: number | null;
  nombre: string;
  descripcion: string;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class TipoMatriculaService {
  private apiUrl = 'http://localhost:8080/api/tipomatricula';

  constructor(private http: HttpClient) {}

  listarTiposMatricula(): Observable<TipoMatricula[]> {
    return this.http.get<TipoMatricula[]>(this.apiUrl);
  }

  crearTipoMatricula(tipo: TipoMatricula): Observable<TipoMatricula> {
    return this.http.post<TipoMatricula>(this.apiUrl, tipo);
  }

  actualizarTipoMatricula(id: number, tipo: TipoMatricula): Observable<TipoMatricula> {
    return this.http.put<TipoMatricula>(`${this.apiUrl}/${id}`, tipo);
  }
/*
  obtenerTipoMatriculaPorId(id: number): Observable<TipoMatricula> {
    return this.http.get<TipoMatricula>(`${this.apiUrl}/${id}`);
  }
*/
  eliminarTipoMatricula(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
