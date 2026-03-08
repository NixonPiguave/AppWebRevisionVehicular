import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TurnoPagado {
  turnoId: number;
  propietarioId: number;
  vehiculoId: number;
  servicioId: number;
  tramiteId?: number | null;
  entidadId?: number | null;
  estado: string;
  montoPagado?: number | null;
  fechaInicio: string;
  fechaFin?: string | null;
  fechaCancelado?: string | null;
}

@Injectable({ providedIn: 'root' })
export class TurnoRecepcionService {

  private readonly API = 'http://localhost:8080/api/turnos';

  constructor(private http: HttpClient) {}

  /** Lista turnos pagados. Si servicioId se indica, solo los de ese servicio (Bloqueo, Desbloqueo, Baja, etc.). */
  listarPagados(servicioId?: number): Observable<TurnoPagado[]> {
    if (servicioId != null) {
      return this.http.get<TurnoPagado[]>(`${this.API}/pagados`, { params: { servicioId: String(servicioId) } });
    }
    return this.http.get<TurnoPagado[]>(`${this.API}/pagados`);
  }

  finalizarTurno(idTurno: number): Observable<any> {
    return this.http.patch(`${this.API}/${idTurno}/estado`, { estado: 'FINALIZADO' });
  }

  finalizarTurnoPut(idTurno: number): Observable<any> {
    return this.http.put(`${this.API}/${idTurno}`, { estado: 'FINALIZADO' });
  }
}
