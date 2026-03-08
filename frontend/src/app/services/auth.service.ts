import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest } from '../models/login-request.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/auth';

  constructor(private http: HttpClient) {}

  login(request: LoginRequest): Observable<any> {
    // Mapear password a contrasena para el backend
    const body = {
      usuario: request.usuario,
      contrasena: request.password
    };

    return this.http.post<any>(`${this.apiUrl}/login`, body).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('usuario', response.usuario);
        localStorage.setItem('nombre', response.nombre);
        localStorage.setItem('usuarioId', response.usuarioId);
        if (response.rol) {
          localStorage.setItem('rol', response.rol);
        } else {
          localStorage.removeItem('rol');
        }
        if (response.permisos && Array.isArray(response.permisos)) {
          localStorage.setItem('permisos', JSON.stringify(response.permisos));
        } else {
          localStorage.removeItem('permisos');
        }
      })
    );
  }

  logout(): Observable<any> {
    const usuarioId = localStorage.getItem('usuarioId');
    return this.http.post<any>(`${this.apiUrl}/logout`, { usuarioId: Number(usuarioId) }).pipe(
      tap(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        localStorage.removeItem('nombre');
        localStorage.removeItem('usuarioId');
        localStorage.removeItem('rol');
        localStorage.removeItem('permisos');
      })
    );
  }

  /** Lista de claves de permisos (menú) del usuario. Si es null o vacío, se muestran todas las opciones. */
  getPermisos(): string[] | null {
    const raw = localStorage.getItem('permisos');
    if (!raw) return null;
    try {
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : null;
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  getNombre(): string | null {
    return localStorage.getItem('nombre');
  }

  getUsuario(): string | null {
    return localStorage.getItem('usuario');
  }

  getUsuarioId(): string | null {
    return localStorage.getItem('usuarioId');
  }

  getRol(): string | null {
    return localStorage.getItem('rol');
  }
}
