import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RecargoCalendarizacion {
  id: number | null;
  clave: string;
  montoRecargo: number;
  descripcion?: string;
}

@Injectable({ providedIn: 'root' })
export class RecargoCalendarizacionService {
  private apiUrl = 'http://localhost:8080/api/recargo-calendarizacion';

  constructor(private http: HttpClient) {}

  obtener(): Observable<RecargoCalendarizacion> {
    return this.http.get<RecargoCalendarizacion>(this.apiUrl);
  }

  actualizar(dto: { montoRecargo: number }): Observable<RecargoCalendarizacion> {
    return this.http.put<RecargoCalendarizacion>(this.apiUrl, dto);
  }
}
