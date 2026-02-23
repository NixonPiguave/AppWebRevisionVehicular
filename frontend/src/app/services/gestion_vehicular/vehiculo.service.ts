import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Vehiculo {
  id: number | null;
  propietarioId: number;
  matricula: string;
  chasis: string;
  vin: string;
  modeloVehiculoId: number;
  anioFabricacion: number;
  color: string;
  estado: string;
  capacidadPasajeros: number;
  tipoVehiculoId: number;
  capCargaId: number;
  ambitoOperacionalId: number;
  ejesId: number;
  traccionId: number;
  tipoCombustibleId: number;
  tipoMatriculaId: number;
  subcategoriaId: number;

  // Campos enriquecidos opcionales
  nombrePropietario?: string;
  nombreModelo?: string;
  nombreTipoVehiculo?: string;
  nombreSubcategoria?: string;
}

@Injectable({
  providedIn: 'root'
})
export class VehiculoService {

  private apiUrl = 'http://localhost:8080/api/vehiculos';

  constructor(private http: HttpClient) {}

  listar(): Observable<Vehiculo[]> {
    return this.http.get<Vehiculo[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<Vehiculo> {
    return this.http.get<Vehiculo>(`${this.apiUrl}/${id}`);
  }

  crear(vehiculo: Vehiculo): Observable<Vehiculo> {
    return this.http.post<Vehiculo>(this.apiUrl, vehiculo);
  }

  actualizar(id: number, vehiculo: Vehiculo): Observable<Vehiculo> {
    return this.http.put<Vehiculo>(`${this.apiUrl}/${id}`, vehiculo);
  }
}
