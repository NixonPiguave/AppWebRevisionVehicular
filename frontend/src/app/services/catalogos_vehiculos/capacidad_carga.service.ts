import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CapacidadCarga {
  id: number | null; // Cambiado a 'id' para que coincida con tu JSON del backend
  capacidad: string;
  descripcion: string;
  estado: string;
  unidad: string;
}

@Injectable({
  providedIn: 'root'
})
export class CapacidadCargaService {
  private apiUrl = 'http://localhost:8080/api/capcarga';

  constructor(private http: HttpClient) {}

  listarCapacidadesCarga(): Observable<CapacidadCarga[]> {
    return this.http.get<CapacidadCarga[]>(this.apiUrl);
  }

  crearCapacidadCarga(capacidad: CapacidadCarga): Observable<CapacidadCarga> {
    return this.http.post<CapacidadCarga>(this.apiUrl, capacidad);
  }

  actualizarCapacidadCarga(id: number, capacidad: CapacidadCarga): Observable<CapacidadCarga> {
    // Aquí el 'id' ya no será undefined porque lo tomamos de la propiedad correcta
    return this.http.put<CapacidadCarga>(`${this.apiUrl}/${id}`, capacidad);
  }
}
