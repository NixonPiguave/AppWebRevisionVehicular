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
      })
    );
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
}
