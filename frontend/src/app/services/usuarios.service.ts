import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaces
export interface Rol {
  rolId: number;
  nombre: string;
  estado: string;
}

export interface Area {
  areaId: number;
  nombre: string;
  descripcion?: string;
  estado: string;
}

export interface Empresa {
  empresaId: number;
  nombre: string;
  direccion?: string;
  telefono?: string;
  correo?: string;
  logoempresa?: string;
  ruc?: string;
}

export interface Usuario {
  usuarioId?: number;
  nombre: string;
  apellido: string;
  usuario: string;
  contrasena: string;
  usuarioBaseDatos?: string;
  contrasenaBaseDatos?: string;
  documentoIdentidad: string;
  email: string;
  estado: string;
  rolesIds: number[];
  roles?: Rol[];
  areaId: number;
  empresaId: number;
  // Campos auxiliares para mostrar nombres en la tabla
  areaNombre?: string;
  empresaNombre?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiUrl = 'http://localhost:8080/api/usuarios';
  private rolesUrl = 'http://localhost:8080/api/roles';
  private areasUrl = 'http://localhost:8080/api/area';
  private empresasUrl = 'http://localhost:8080/(api/empresa)';

  constructor(private http: HttpClient) { }

  // CRUD Usuarios
  listarUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  obtenerUsuario(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  crearUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, usuario);
  }

  actualizarUsuario(id: number, usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, usuario);
  }

  eliminarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Cargar datos para los selects
  listarRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(this.rolesUrl);
  }

  listarAreas(): Observable<Area[]> {
    return this.http.get<Area[]>(this.areasUrl);
  }

  listarEmpresas(): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(this.empresasUrl);
  }
}
