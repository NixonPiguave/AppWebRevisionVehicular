import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Rol {
  rolId: number | null;
  nombre: string;
  estado: string;
}

export interface Permiso {
  permisoId: number;
  nombre: string;
  modulo: string;
  estado: string;
  descripcion: string;
  seleccionado?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  private apiUrl = 'http://localhost:8080/api/roles';
  private permisosUrl = 'http://localhost:8080/api/permisos';

  constructor(private http: HttpClient) {}

  listarRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(this.apiUrl);
  }

  crearRol(rol: any): Observable<Rol> {
    return this.http.post<Rol>(this.apiUrl, rol);
  }

  actualizarRol(id: number, rol: any): Observable<Rol> {
    return this.http.put<Rol>(`${this.apiUrl}/${id}`, rol);
  }

  listarPermisos(): Observable<Permiso[]> {
    return this.http.get<Permiso[]>(this.permisosUrl);
  }
}
