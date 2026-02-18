import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Umbral {
  idUmbral: number | null;
  valorMin: number;
  valorMax: number;
  idUnidadMedida: number;
  estado: string;

  // Campo enriquecido opcional
  nombreUnidad?: string;
}

export interface UnidadMedida {
  idUnidadMedida: number;
  nombre: string;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class UmbralService {

  private apiUrl = 'http://localhost:8080/api/umbral';
  private unidadUrl = 'http://localhost:8080/api/unidadesmedida';

  constructor(private http: HttpClient) {}

  listar(): Observable<Umbral[]> {
    return this.http.get<Umbral[]>(this.apiUrl);
  }

  crear(umbral: Umbral): Observable<Umbral> {
    return this.http.post<Umbral>(this.apiUrl, umbral);
  }

  actualizar(id: number, umbral: Umbral): Observable<Umbral> {
    return this.http.put<Umbral>(`${this.apiUrl}/${id}`, umbral);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  listarUnidades(): Observable<UnidadMedida[]> {
    return this.http.get<UnidadMedida[]>(this.unidadUrl);
  }
}
