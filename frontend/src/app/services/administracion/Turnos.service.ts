import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Turnos } from '../../models/Turnos.model';

@Injectable({
  providedIn: 'root'
})
export class TurnosService {
  private apiUrl = 'http://localhost:8080/api/turnos';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Turnos[]> {
    return this.http.get<Turnos[]>(this.apiUrl);
  }

  getById(id: number): Observable<Turnos> {
    return this.http.get<Turnos>(`${this.apiUrl}/${id}`);
  }

  create(turno: Turnos): Observable<Turnos> {
    return this.http.post<Turnos>(this.apiUrl, turno);
  }

  update(id: number, turno: Turnos): Observable<Turnos> {
    return this.http.put<Turnos>(`${this.apiUrl}/${id}`, turno);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
