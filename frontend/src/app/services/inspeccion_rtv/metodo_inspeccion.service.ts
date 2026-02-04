import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MetodoInspeccion {
  metodoInspeccionId: number | null;
  nombre: string;
  descripcion: string;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class MetodoInspeccionService {

  // URL del backend para metodo de inspección
  private apiUrl = 'http://localhost:8080/api/metodo-inspeccion';

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los métodos de inspección
   */
  listarMetodosInspeccion(): Observable<MetodoInspeccion[]> {
    return this.http.get<MetodoInspeccion[]>(this.apiUrl);
  }

  /**
   * Crear un nuevo metodo de inspección
   */
  crearMetodoInspeccion(metodo: MetodoInspeccion): Observable<MetodoInspeccion> {
    return this.http.post<MetodoInspeccion>(this.apiUrl, metodo);
  }

  /**
   * Actualizar un metodo de inspección
   */
  actualizarMetodoInspeccion(id: number, metodo: MetodoInspeccion): Observable<MetodoInspeccion> {
    return this.http.put<MetodoInspeccion>(`${this.apiUrl}/${id}`, metodo);
  }
}
