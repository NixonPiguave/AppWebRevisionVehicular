import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Linea {
  id: number | null;
  nombre: string;
  descripcion: string;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class LineasService {

  // Cambia esto si tu backend está en otro puerto
  private apiUrl = 'http://localhost:8080/api/lineas';

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los roles
   */
  listarRoles(): Observable<Linea[]> {
    return this.http.get<Linea[]>(this.apiUrl);
  }

  /**
   * Crear un nuevo rol
   */
  crearRol(rol: Linea): Observable<Linea> {
    return this.http.post<Linea>(this.apiUrl, rol);
  }

  /**
   * Actualizar un rol
   */
  actualizarRol(id: number, rol: Linea): Observable<Linea> {
    return this.http.put<Linea>(`${this.apiUrl}/${id}`, rol);
  }
}
