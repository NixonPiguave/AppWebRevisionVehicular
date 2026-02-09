import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UnidadMedida {
  idUnidadMedida: number | null;
  nombre: string;
  simbolo: string;
  descripcion: string;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class UnidadMedidaService {
  private apiUrl = 'http://localhost:8080/api/unidadesmedida';

  constructor(private http: HttpClient) {}

  listarUnidadesMedida(): Observable<UnidadMedida[]> {
    return this.http.get<UnidadMedida[]>(this.apiUrl);
  }

  crearUnidadMedida(unidad: UnidadMedida): Observable<UnidadMedida> {
    return this.http.post<UnidadMedida>(this.apiUrl, unidad);
  }

  actualizarUnidadMedida(id: number, unidad: UnidadMedida): Observable<UnidadMedida> {
    return this.http.put<UnidadMedida>(`${this.apiUrl}/${id}`, unidad);
  }

  obtenerUnidadMedidaPorId(id: number): Observable<UnidadMedida> {
    return this.http.get<UnidadMedida>(`${this.apiUrl}/${id}`);
  }

  eliminarUnidadMedida(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
