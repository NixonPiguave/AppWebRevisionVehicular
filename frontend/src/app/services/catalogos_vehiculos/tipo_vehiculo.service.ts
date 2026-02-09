import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TipoCombustible {
  id: number | null;
  nombre: string;
  descripcion: string;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class TipoCombustibleService {
  private apiUrl = 'http://localhost:8080/api/combustible';

  constructor(private http: HttpClient) {}

  listarTiposCombustible(): Observable<TipoCombustible[]> {
    return this.http.get<TipoCombustible[]>(this.apiUrl);
  }

  crearTipoCombustible(tipo: TipoCombustible): Observable<TipoCombustible> {
    return this.http.post<TipoCombustible>(this.apiUrl, tipo);
  }

  actualizarTipoCombustible(id: number, tipo: TipoCombustible): Observable<TipoCombustible> {
    return this.http.put<TipoCombustible>(`${this.apiUrl}/${id}`, tipo);
  }

  obtenerTipoCombustiblePorId(id: number): Observable<TipoCombustible> {
    return this.http.get<TipoCombustible>(`${this.apiUrl}/${id}`);
  }

  eliminarTipoCombustible(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
