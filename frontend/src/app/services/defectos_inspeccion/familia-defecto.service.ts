import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FamiliaDefecto {
  familiaId: number | null;
  nombre: string;
  descripcion: string;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class FamiliaDefectoService {

  // URL del backend para familias de defectos
  private apiUrl = 'http://localhost:8080/api/familias-defectos';

  constructor(private http: HttpClient) {}

  /**
   * Obtener todas las familias de defectos
   */
  listarFamiliasDefectos(): Observable<FamiliaDefecto[]> {
    return this.http.get<FamiliaDefecto[]>(this.apiUrl);
  }

  /**
   * Crear una nueva familia de defecto
   */
  crearFamiliaDefecto(familiaDefecto: FamiliaDefecto): Observable<FamiliaDefecto> {
    return this.http.post<FamiliaDefecto>(this.apiUrl, familiaDefecto);
  }

  /**
   * Actualizar una familia de defecto
   */
  actualizarFamiliaDefecto(id: number, familiaDefecto: FamiliaDefecto): Observable<FamiliaDefecto> {
    return this.http.put<FamiliaDefecto>(`${this.apiUrl}/${id}`, familiaDefecto);
  }

  /**
   * Obtener una familia de defecto por ID
   */
  obtenerFamiliaDefecto(id: number): Observable<FamiliaDefecto> {
    return this.http.get<FamiliaDefecto>(`${this.apiUrl}/${id}`);
  }
}
