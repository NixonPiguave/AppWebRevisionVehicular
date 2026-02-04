import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TipoDefecto {
  tipoDefectoId: number | null;
  codigo: string;
  nombre: string;
  descripcion: string;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class TiposDefectosService {

  // URL del backend para tipos de defectos
  private apiUrl = 'http://localhost:8080/api/tipos-defectos';

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los tipos de defectos
   */
  listarTiposDefectos(): Observable<TipoDefecto[]> {
    return this.http.get<TipoDefecto[]>(this.apiUrl);
  }

  /**
   * Crear un nuevo tipo de defecto
   */
  crearTipoDefecto(tipoDefecto: TipoDefecto): Observable<TipoDefecto> {
    return this.http.post<TipoDefecto>(this.apiUrl, tipoDefecto);
  }

  /**
   * Actualizar un tipo de defecto
   */
  actualizarTipoDefecto(id: number, tipoDefecto: TipoDefecto): Observable<TipoDefecto> {
    return this.http.put<TipoDefecto>(`${this.apiUrl}/${id}`, tipoDefecto);
  }

  /**
   * Obtener un tipo de defecto por ID
   */
  obtenerTipoDefecto(id: number): Observable<TipoDefecto> {
    return this.http.get<TipoDefecto>(`${this.apiUrl}/${id}`);
  }
}
