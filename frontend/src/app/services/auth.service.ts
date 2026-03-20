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
        if (response.sesionAnteriorCerrada) {
          sessionStorage.setItem('authInfoMessage', 'Has iniciado sesión desde otro dispositivo. La sesión anterior en este navegador fue cerrada.');
        }
      })
    );
  }

  logout(): Observable<any> {
    const token = this.getToken();
    if (token) this.notifyServerLogoutBeacon();
    const headers: { [key: string]: string } = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    // Token en query (evita 415/500 con body; Edge acepta query params)
    const url = token ? `${this.apiUrl}/logout?token=${encodeURIComponent(token)}` : `${this.apiUrl}/logout`;
    return this.http.post<any>(url, {}, { headers }).pipe(
      tap({
        next: () => this.limpiarStorage(),
        error: () => {
          // Si falla la petición HTTP, intentar con sendBeacon como respaldo
          this.notifyServerLogoutBeacon();
          this.limpiarStorage();
        }
      })
    );
  }

  private limpiarStorage(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('nombre');
    localStorage.removeItem('usuarioId');
    localStorage.removeItem('rol');
    localStorage.removeItem('permisos');
  }

  /**
   * Aviso de cierre al servidor. Token en query evita 415 (Edge rechaza form-urlencoded).
   */
  notifyServerLogoutBeacon(): void {
    const token = this.getToken();
    if (!token) return;
    try {
      const url = `${this.apiUrl}/logout?token=${encodeURIComponent(token)}`;
      if (navigator.sendBeacon) {
        navigator.sendBeacon(url);
      } else {
        void fetch(url, { method: 'POST', keepalive: true });
      }
    } catch {
      /* ignorar */
    }
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

  /**
   * Comprueba si la sesión sigue activa. Si el backend devuelve 401 (sesión cerrada por admin o nuevo login),
   * el interceptor redirige a login. Usar en un intervalo para que la pantalla se cierre automáticamente al ser desconectado.
   */
  checkSession(): Observable<unknown> {
    return this.http.get(`${this.apiUrl}/check-session`);
  }
}
