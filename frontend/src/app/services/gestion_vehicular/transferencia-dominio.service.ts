import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TurnoTransferenciaDominio {
  turnoId: number;
  /** Persona ligada al turno (referencia); el nuevo dueño se elige al ejecutar. */
  solicitanteTurnoId: number | null;
  solicitanteTurnoNombre: string | null;
  servicioId: number | null;
  servicioNombre: string | null;
  estado: string;
  fechaInicio: string;
  vehiculoId: number | null;
  vehiculoPlaca: string | null;
  propietarioAnteriorNombre: string | null;
}

export interface EjecutarTransferenciaResponse {
  mensaje: string;
  matricula: string;
}

@Injectable({ providedIn: 'root' })
export class TransferenciaDominioService {
  private readonly api = 'http://localhost:8080/api/transferencia-dominio';

  constructor(private http: HttpClient) {}

  listarTurnosEnProceso(servicioId: number): Observable<TurnoTransferenciaDominio[]> {
    return this.http.get<TurnoTransferenciaDominio[]>(`${this.api}/turnos-en-proceso`, {
      params: { servicioId: String(servicioId) }
    });
  }

  ejecutar(turnoId: number, nuevoPropietarioId: number): Observable<EjecutarTransferenciaResponse> {
    return this.http.post<EjecutarTransferenciaResponse>(`${this.api}/ejecutar`, {
      turnoId,
      nuevoPropietarioId
    });
  }
}
