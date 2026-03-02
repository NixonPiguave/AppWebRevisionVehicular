import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BajaVehiculo } from '../../models/BajaVehiculo.model';

@Injectable({
  providedIn: 'root'
})
export class BajaVehiculoService {
  private apiUrl = 'http://localhost:8080/api/bajas-vehiculo';

  constructor(private http: HttpClient) {}

  getAll(): Observable<BajaVehiculo[]> {
    return this.http.get<BajaVehiculo[]>(this.apiUrl);
  }

  getById(id: number): Observable<BajaVehiculo> {
    return this.http.get<BajaVehiculo>(`${this.apiUrl}/${id}`);
  }

  create(baja: BajaVehiculo): Observable<BajaVehiculo> {
    return this.http.post<BajaVehiculo>(this.apiUrl, baja);
  }

  update(id: number, baja: BajaVehiculo): Observable<BajaVehiculo> {
    return this.http.put<BajaVehiculo>(`${this.apiUrl}/${id}`, baja);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

