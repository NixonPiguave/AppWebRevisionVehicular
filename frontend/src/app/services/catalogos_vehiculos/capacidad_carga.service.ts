import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CapacidadCarga {
  capacidadCargaId: number | null;
  capacidad: string;
  descripcion: string;
  estado: string;
  unidad: string;
}

@Injectable({
  providedIn: 'root'
})
export class CapacidadCargaService {

  // URL del backend para capacidad de carga
  private apiUrl = 'http://localhost:8080/api/capcarga';

  constructor(private http: HttpClient) {}

  /** Obtener todas las capacidades de carga */
  listarCapacidadesCarga(): Observable<CapacidadCarga[]> {
    return this.http.get<CapacidadCarga[]>(this.apiUrl);
  }

  /** Crear una nueva capacidad de carga */
  crearCapacidadCarga(capacidad: CapacidadCarga): Observable<CapacidadCarga> {
    return this.http.post<CapacidadCarga>(this.apiUrl, capacidad);
  }

  /** Actualizar una capacidad de carga */
  actualizarCapacidadCarga(id: number, capacidad: CapacidadCarga): Observable<CapacidadCarga> {
    return this.http.put<CapacidadCarga>(`${this.apiUrl}/${id}`, capacidad);
  }
}
