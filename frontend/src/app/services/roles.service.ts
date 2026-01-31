import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Rol {
  rolId: number | null;
  nombre: string;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  // Cambia esto si tu backend está en otro puerto
  private apiUrl = 'http://localhost:8080/api/roles';

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los roles
   */
  listarRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(this.apiUrl);
  }

  /**
   * Crear un nuevo rol
   */
  crearRol(rol: Rol): Observable<Rol> {
    return this.http.post<Rol>(this.apiUrl, rol);
  }

  /**
   * Actualizar un rol (para cuando tu compañero tenga el SP listo)
   */
  actualizarRol(id: number, rol: Rol): Observable<Rol> {
    return this.http.put<Rol>(`${this.apiUrl}/${id}`, rol);
  }
}
