import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SubfamiliaDefecto {
  subfamiliaId: number | null;
  familiaId: number;
  nombre: string;
  descripcion: string;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class SubfamiliaDefectoService {

  // URL del backend para subfamilias de defectos
  private apiUrl = 'http://localhost:8080/api/subfamilias-defectos';

  constructor(private http: HttpClient) {}

  /**
   * Obtener todas las subfamilias de defectos
   */
  listarSubfamiliasDefectos(): Observable<SubfamiliaDefecto[]> {
    return this.http.get<SubfamiliaDefecto[]>(this.apiUrl);
  }

  /**
   * Crear una nueva subfamilia de defecto
   */
  crearSubfamiliaDefecto(subfamiliaDefecto: SubfamiliaDefecto): Observable<SubfamiliaDefecto> {
    return this.http.post<SubfamiliaDefecto>(this.apiUrl, subfamiliaDefecto);
  }

  /**
   * Actualizar una subfamilia de defecto
   */
  actualizarSubfamiliaDefecto(id: number, subfamiliaDefecto: SubfamiliaDefecto): Observable<SubfamiliaDefecto> {
    return this.http.put<SubfamiliaDefecto>(`${this.apiUrl}/${id}`, subfamiliaDefecto);
  }

  /**
   * Obtener una subfamilia de defecto por ID
   */
  obtenerSubfamiliaDefecto(id: number): Observable<SubfamiliaDefecto> {
    return this.http.get<SubfamiliaDefecto>(`${this.apiUrl}/${id}`);
  }
}
