import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Equipo {
  equipoId: number | null;
  influencia: number;
  equipoId_fk: string;
  fechaUltimaCalibracion: Date | null;
  fechaUltimoMantenimiento: Date | null;
  estado: string;
  codigoInterno: string;
  equipo: string;
  modelo: string;
  serialEquipo: string;
}

@Injectable({
  providedIn: 'root'
})
export class EquiposService {

  // URL del backend para equipos
  private apiUrl = 'http://localhost:8080/api/equipos';

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los equipos
   */
  listarEquipos(): Observable<Equipo[]> {
    return this.http.get<Equipo[]>(this.apiUrl);
  }

  /**
   * Crear un nuevo equipo
   */
  crearEquipo(equipo: Equipo): Observable<Equipo> {
    return this.http.post<Equipo>(this.apiUrl, equipo);
  }

  /**
   * Actualizar un equipo
   */
  actualizarEquipo(id: number, equipo: Equipo): Observable<Equipo> {
    return this.http.put<Equipo>(`${this.apiUrl}/${id}`, equipo);
  }

  /**
   * Obtener un equipo por ID
   */
  obtenerEquipo(id: number): Observable<Equipo> {
    return this.http.get<Equipo>(`${this.apiUrl}/${id}`);
  }
}
