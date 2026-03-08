import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RegistroBaseUnicaVehiculo {
  idRegistroBaseUnica?: number | null;
  tramiteId?: number | null;
  vehiculoId: number | null;
  registroSriId?: number | null;
  usuarioId?: number | null;
  tipoOrigen: string;
  documentoOrigen?: string | null;
  fechaRegistro: string;
  estado: string;
}

@Injectable({ providedIn: 'root' })
export class RegistroBaseUnicaVehiculoService {
  private apiUrl = 'http://localhost:8080/api/registro-base-unica-vehiculos';

  constructor(private http: HttpClient) {}

  listar(): Observable<RegistroBaseUnicaVehiculo[]> {
    return this.http.get<RegistroBaseUnicaVehiculo[]>(this.apiUrl);
  }

  crear(dto: RegistroBaseUnicaVehiculo): Observable<RegistroBaseUnicaVehiculo> {
    return this.http.post<RegistroBaseUnicaVehiculo>(this.apiUrl, dto);
  }

  actualizar(id: number, dto: RegistroBaseUnicaVehiculo): Observable<RegistroBaseUnicaVehiculo> {
    return this.http.put<RegistroBaseUnicaVehiculo>(`${this.apiUrl}/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
