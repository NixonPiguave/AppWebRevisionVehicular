import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Turnos } from '../../models/Turnos.model';

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

  // Devuelve solo los turnos que tienen monto pagado registrado
  getPagados(): Observable<Turnos[]> {
    return this.getAll().pipe(
      map((turnos: Turnos[]) => turnos.filter(t => t.montoPagado != null))
    );
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

  // Consulta la tarifa activa del servicio asignado al turno
  obtenerTarifa(turnoId: number): Observable<{ tarifa: number }> {
    return this.http.get<{ tarifa: number }>(`${this.apiUrl}/${turnoId}/tarifa`);
  }

  // Registra el pago usando PATCH
  registrarPago(id: number, montoPagado: number): Observable<Turnos> {
    return this.http.patch<Turnos>(`${this.apiUrl}/${id}/pago`, { montoPagado });
  }

  // Cambia el estado del turno (ej. GENERADO → CONFIRMADO)
  cambiarEstado(id: number, estado: string): Observable<Turnos> {
    return this.http.patch<Turnos>(`${this.apiUrl}/${id}/estado`, { estado });
  }
}
