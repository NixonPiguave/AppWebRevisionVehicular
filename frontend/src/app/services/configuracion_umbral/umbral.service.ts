import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Umbral {
  idUmbral: number | null;
  valorMin: number;
  valorMax: number;
  calificacion: number;
  incValorMin: number;
  incValorMax: number;
  idUnidadMedida: number;
  idDescripcionUmbral: number;
  estado: string;

  // Campos enriquecidos opcionales
  nombreUnidad?: string;
  nombreDescripcion?: string;
}

export interface UnidadMedida {
  idUnidadMedida: number;
  nombre: string;
  estado: string;
}

export interface DescripcionUmbral {
  idDescripcionUmbral: number;
  descripcion: string;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class UmbralService {

  private apiUrl = 'http://localhost:8080/api/umbral';
  private unidadUrl = 'http://localhost:8080/api/unidadesmedida';
  private descripcionUrl = 'http://localhost:8080/api/descripcionumbral';

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
  listarDescripciones(): Observable<DescripcionUmbral[]> {
    return this.http.get<DescripcionUmbral[]>(this.descripcionUrl);
  }
}
