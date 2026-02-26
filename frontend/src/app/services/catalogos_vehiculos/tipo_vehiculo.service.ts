import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TipoVehiculo {
  id: number | null;
  nombre: string;
  descripcion: string;
  estado: string;
  claseId: number;
  claseNombre?: string;
}

export interface Clase {
  id: number | null;
  clase: string;
  descripcion: string;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class TipoVehiculoService {
  private apiUrl = 'http://localhost:8080/api/tipoVehiculo';
  private clasUrl = 'http://localhost:8080/api/clases';

  constructor(private http: HttpClient) {}

  listar(): Observable<TipoVehiculo[]> {
    return this.http.get<TipoVehiculo[]>(this.apiUrl);
  }

  crear(tipoVehiculo: TipoVehiculo): Observable<TipoVehiculo> {
    return this.http.post<TipoVehiculo>(this.apiUrl, tipoVehiculo);
  }

  actualizar(id: number, tipoVehiculo: TipoVehiculo): Observable<TipoVehiculo> {
    return this.http.put<TipoVehiculo>(`${this.apiUrl}/${id}`, tipoVehiculo);
  }

  listarClases(): Observable<Clase[]> {
    return this.http.get<Clase[]>(this.clasUrl);
  }
}
