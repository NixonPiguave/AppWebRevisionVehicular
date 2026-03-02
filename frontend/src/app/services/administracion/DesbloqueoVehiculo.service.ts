import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DesbloqueoVehiculo } from '../../models/DesbloqueoVehiculo.model';

@Injectable({
  providedIn: 'root'
})
export class DesbloqueoVehiculoService {
  private apiUrl = 'http://localhost:8080/api/desbloqueos-vehiculo';

  constructor(private http: HttpClient) {}

  getAll(): Observable<DesbloqueoVehiculo[]> {
    return this.http.get<DesbloqueoVehiculo[]>(this.apiUrl);
  }

  getById(id: number): Observable<DesbloqueoVehiculo> {
    return this.http.get<DesbloqueoVehiculo>(`${this.apiUrl}/${id}`);
  }

  create(desbloqueo: DesbloqueoVehiculo): Observable<DesbloqueoVehiculo> {
    return this.http.post<DesbloqueoVehiculo>(this.apiUrl, desbloqueo);
  }

  update(id: number, desbloqueo: DesbloqueoVehiculo): Observable<DesbloqueoVehiculo> {
    return this.http.put<DesbloqueoVehiculo>(`${this.apiUrl}/${id}`, desbloqueo);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

