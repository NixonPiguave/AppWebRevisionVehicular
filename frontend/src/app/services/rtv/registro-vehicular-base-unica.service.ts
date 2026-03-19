import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vehiculo } from '../gestion_vehicular/vehiculo.service';

export interface TurnoRegistroBaseUnica {
  turnoId: number;
  propietarioId: number | null;
  propietarioNombre: string;
  servicioId: number | null;
  servicioNombre: string | null;
  estado: string;
  fechaInicio: string;
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

export interface RegistrarBaseUnicaRequest {
  turnoId: number;
  placaDisponibleId: number;
  vehiculo: Vehiculo;
  improntaChasisTipo?: string;
  improntaMotorTipo?: string;
}

export interface RegistrarBaseUnicaResponse {
  turnoId: number;
  vehiculoId: number;
  placaActual: string;
  numeroMatriculaVehicular: string;
}

@Injectable({ providedIn: 'root' })
export class RegistroVehicularBaseUnicaService {
  private readonly api = 'http://localhost:8080/api/registro-vehicular-base-unica';
  private readonly apiPlacas = 'http://localhost:8080/api/ant/placas-disponibles';

  constructor(private http: HttpClient) {}

  listarTurnosEnProceso(servicioId: number): Observable<TurnoRegistroBaseUnica[]> {
    return this.http.get<TurnoRegistroBaseUnica[]>(`${this.api}/turnos-en-proceso`, {
      params: { servicioId: String(servicioId) }
    });
  }

  listarPlacasDisponibles(): Observable<PlacaDisponible[]> {
    return this.http.get<PlacaDisponible[]>(this.apiPlacas);
  }

  registrar(req: RegistrarBaseUnicaRequest): Observable<RegistrarBaseUnicaResponse> {
    return this.http.post<RegistrarBaseUnicaResponse>(`${this.api}/registrar`, req);
  }
}

