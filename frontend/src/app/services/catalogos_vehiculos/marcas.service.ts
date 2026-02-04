import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MarcaVehiculo {
  id: number | null;
  nombre: string;
  empresa: string;
  paisOrigen: string;
  grupoAutomotriz: string;
  fechaAlta: string | null;
  fechaBaja: string | null;
  logoUrl: string;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class MarcaVehiculoService {
  private apiUrl = 'http://localhost:8080/api/marcas';

  constructor(private http: HttpClient) {}

  listarMarcas(): Observable<MarcaVehiculo[]> {
    return this.http.get<MarcaVehiculo[]>(this.apiUrl);
  }

  crearMarca(marca: MarcaVehiculo): Observable<MarcaVehiculo> {
    return this.http.post<MarcaVehiculo>(this.apiUrl, marca);
  }

  actualizarMarca(id: number, marca: MarcaVehiculo): Observable<MarcaVehiculo> {
    return this.http.put<MarcaVehiculo>(`${this.apiUrl}/${id}`, marca);
  }

  obtenerMarcaPorId(id: number): Observable<MarcaVehiculo> {
    return this.http.get<MarcaVehiculo>(`${this.apiUrl}/${id}`);
  }

  eliminarMarca(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
