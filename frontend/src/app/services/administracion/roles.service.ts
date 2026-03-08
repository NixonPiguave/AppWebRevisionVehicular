import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Rol {
  rolId: number | null;
  nombre: string;
  estado: string;
  permisoIds?: number[];
  /** IDs de opciones de menú (tabla srtv_rol_opcion_menu) para Accesos por rol */
  opcionMenuIds?: number[];
}

export interface Permiso {
  permisoId: number;
  nombre: string;
  modulo: string;
  estado: string;
  descripcion: string;
  seleccionado?: boolean;
}

/** Opción de menú para configurar visibilidad por rol (tabla srtv_opcion_menu). No confundir con Permiso (srtv_permiso). */
export interface OpcionMenu {
  opcionMenuId: number;
  clave: string;
  nombreVisible: string;
  modulo: string;
  orden: number;
}

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  private apiUrl = 'http://localhost:8080/api/roles';
  private permisosUrl = 'http://localhost:8080/api/permisos';
  private opcionesMenuUrl = 'http://localhost:8080/api/opciones-menu';

  constructor(private http: HttpClient) {}

  listarRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(this.apiUrl);
  }

  obtenerRol(id: number): Observable<Rol> {
    return this.http.get<Rol>(`${this.apiUrl}/${id}`);
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

  listarOpcionesMenu(): Observable<OpcionMenu[]> {
    return this.http.get<OpcionMenu[]>(this.opcionesMenuUrl);
  }

  actualizarOpcionesMenu(rolId: number, opcionMenuIds: number[]): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${rolId}/opciones-menu`, opcionMenuIds);
  }
}
