import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SolicitudPlacasAnt {
  idSolicitud: number;
  fechaSolicitud: string;
  cantidad: number;
  letraProvincia: string;
  tipoServicio: string;
  estado: string; // PENDIENTE/RECIBIDO
}

export interface PlacaDisponible {
  idPlacaDisponible: number;
  serieAlfanumerica: string;
  letraProvincia: string;
  tipoServicio: string;
  letraSecuencial: string;
  fechaRecepcion: string;
  estado: string;
}

@Injectable({ providedIn: 'root' })
export class SolicitudesPlacasAntService {
  private readonly api = 'http://localhost:8080/api/ant/solicitudes-placas';
  private readonly apiPlacas = 'http://localhost:8080/api/ant/placas-disponibles';

  constructor(private http: HttpClient) {}

  listar(estado?: string): Observable<SolicitudPlacasAnt[]> {
    return this.http.get<SolicitudPlacasAnt[]>(this.api, { params: estado ? { estado } : {} });
  }

  crear(cantidad: number, letraProvincia: string, tipoServicio: string): Observable<SolicitudPlacasAnt> {
    return this.http.post<SolicitudPlacasAnt>(this.api, { cantidad, letraProvincia, tipoServicio });
  }

  recibir(idSolicitud: number): Observable<PlacaDisponible[]> {
    return this.http.post<PlacaDisponible[]>(`${this.api}/${idSolicitud}/recibir`, {});
  }

  /** Inventario de placas en estado DISPONIBLE (solo consulta). */
  listarPlacasDisponibles(): Observable<PlacaDisponible[]> {
    return this.http.get<PlacaDisponible[]>(this.apiPlacas);
  }
}

