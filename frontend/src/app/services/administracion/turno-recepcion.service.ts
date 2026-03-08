import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TurnoRecepcionService {

  private readonly API = 'http://localhost:8080/api/turnos';

  constructor(private http: HttpClient) {}

  finalizarTurno(idTurno: number): Observable<any> {
    return this.http.patch(`${this.API}/${idTurno}/estado`, { estado: 'FINALIZADO' });
  }

  finalizarTurnoPut(idTurno: number): Observable<any> {
    return this.http.put(`${this.API}/${idTurno}`, { estado: 'FINALIZADO' });
  }
}
