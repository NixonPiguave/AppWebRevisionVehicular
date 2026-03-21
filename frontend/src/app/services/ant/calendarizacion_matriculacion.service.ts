import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CalendarizacionMatriculacion {
  idCalendarizacion: number | null;
  ultimoDigitoPlaca: number;
  mes: number;
  tipo: number;
  estado: string;
}

/** Para mostrar en la página de calendarización (desde BD) */
export interface CalendarizacionRtvDisplay {
  digito: number;
  mesObligatorio: number;
  mesNombre: string;
  opcionales: string;
}

@Injectable({
  providedIn: 'root'
})
export class CalendarizacionMService {
  private apiUrl = 'http://localhost:8080/api/calendarizacionmatriculacion';

  constructor(private http: HttpClient) {}

  listar(): Observable<CalendarizacionMatriculacion[]> {
    return this.http.get<CalendarizacionMatriculacion[]>(this.apiUrl);
  }

  listarRtvDisplay(): Observable<CalendarizacionRtvDisplay[]> {
    return this.http.get<CalendarizacionRtvDisplay[]>(`${this.apiUrl}/rtv-display`);
  }

  crear(calendarizacionM: CalendarizacionMatriculacion): Observable<CalendarizacionMatriculacion> {
    return this.http.post<CalendarizacionMatriculacion>(this.apiUrl, calendarizacionM);
  }

  actualizar(id: number, calendarizacionM: CalendarizacionMatriculacion): Observable<CalendarizacionMatriculacion> {
    return this.http.put<CalendarizacionMatriculacion>(`${this.apiUrl}/${id}`, calendarizacionM);
  }

}
