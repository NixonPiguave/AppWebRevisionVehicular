import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BloqueoVehiculo } from '../../models/BloqueoVehiculo.model';

@Injectable({
  providedIn: 'root'
})
export class BloqueoVehiculoService {
  private apiUrl = 'http://localhost:8080/api/bloqueos-vehiculo';

  constructor(private http: HttpClient) {}

  getAll(): Observable<BloqueoVehiculo[]> {
    return this.http.get<BloqueoVehiculo[]>(this.apiUrl);
  }

  getById(id: number): Observable<BloqueoVehiculo> {
    return this.http.get<BloqueoVehiculo>(`${this.apiUrl}/${id}`);
  }

  create(bloqueo: BloqueoVehiculo): Observable<BloqueoVehiculo> {
    return this.http.post<BloqueoVehiculo>(this.apiUrl, bloqueo);
  }

  update(id: number, bloqueo: BloqueoVehiculo): Observable<BloqueoVehiculo> {
    return this.http.put<BloqueoVehiculo>(`${this.apiUrl}/${id}`, bloqueo);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

