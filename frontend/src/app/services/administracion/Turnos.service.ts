import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Turnos } from '../../models/Turnos.model';

export interface TarifaConCalendarizacion {
  tarifa: number;
  recargo: number;
  total: number;
  estadoCalendarizacion: 'OPORTUNO' | 'OPCIONAL' | 'CON_RECARGO';
  mesObligatorio: number;
  ultimoDigitoPlaca: number;
  /** Sin recargo por calendarización: bloqueo activo o baja concluida */
  exentoRecargoRtvPorBloqueoOBaja?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TurnosService {

  private apiUrl = 'http://localhost:8080/api/turnos';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Turnos[]> {
    return this.http.get<Turnos[]>(this.apiUrl);
  }

  getById(id: number): Observable<Turnos> {
    return this.http.get<Turnos>(`${this.apiUrl}/${id}`);
  }

  // Devuelve turnos con estado PAGADO. Si lineaId se indica, filtra por categoría del vehículo (L=motos, M=carros).
  getPagados(servicioId?: number, lineaId?: number): Observable<Turnos[]> {
    const params = new URLSearchParams();
    if (servicioId != null) params.set('servicioId', String(servicioId));
    if (lineaId != null) params.set('lineaId', String(lineaId));
    const qs = params.toString();
    return this.http.get<Turnos[]>(`${this.apiUrl}/pagados${qs ? '?' + qs : ''}`);
  }

  getPorEstado(estado: string): Observable<Turnos[]> {
    return this.http.get<Turnos[]>(`${this.apiUrl}?estado=${encodeURIComponent(estado)}`);
  }

  create(turno: Turnos): Observable<Turnos> {
    return this.http.post<Turnos>(this.apiUrl, turno);
  }

  update(id: number, turno: Turnos): Observable<Turnos> {
    return this.http.put<Turnos>(`${this.apiUrl}/${id}`, turno);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /** Tarifa con calendarización (incluye recargo si aplica) */
  obtenerTarifa(turnoId: number): Observable<TarifaConCalendarizacion> {
    return this.http.get<TarifaConCalendarizacion>(`${this.apiUrl}/${turnoId}/tarifa`);
  }

  // Registra el pago usando PATCH
  registrarPago(id: number, montoPagado: number): Observable<Turnos> {
    return this.http.patch<Turnos>(`${this.apiUrl}/${id}/pago`, { montoPagado });
  }

  // Cambia el estado del turno (ej. GENERADO → CONFIRMADO)
  cambiarEstado(id: number, estado: string): Observable<Turnos> {
    return this.http.patch<Turnos>(`${this.apiUrl}/${id}/estado`, { estado });
  }

  // Métodos de inspección pendientes para el turno (no realizados según detalleinspección)
  getMetodosInspeccionPendientes(turnoId: number): Observable<{ id: number; nombre: string; descripcion?: string; estado?: string }[]> {
    return this.http.get<{ id: number; nombre: string; descripcion?: string; estado?: string }[]>(
      `${this.apiUrl}/${turnoId}/metodos-inspeccion-pendientes`
    );
  }
}
